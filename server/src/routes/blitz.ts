import { Router, Request, Response } from "express";
import { CfApiError, fetchUserInfo, fetchUserStatus, problemKey } from "../codeforces.js";
import { getProblemset } from "../problemCache.js";
import { NoProblemsError, buildDuelTargets, buildSoloTargets, effectiveRating, selectProblems } from "../blitzAlgorithm.js";
import { createSession, type BlitzMode } from "../blitzSession.js";
import { deleteSession, getSession, saveSession } from "../sessionStore.js";
import { getJudgeableKeys, hasStatement } from "../problemDb.js";

const router = Router();

function handleError(res: Response, e: unknown) {
  if (e instanceof NoProblemsError) {
    res.status(409).json({ error: "NO_PROBLEMS", message: `Couldn't find enough unsolved problems near rating ${e.target}.` });
    return;
  }
  if (e instanceof CfApiError) {
    res.status(e.kind === "NOT_FOUND" ? 404 : e.kind === "RATE_LIMITED" ? 429 : 502).json({ error: e.kind, message: e.message });
    return;
  }
  console.error(e);
  res.status(500).json({ error: "INTERNAL", message: "Unexpected server error." });
}

interface CreateSessionBody {
  mode?: BlitzMode;
  handle?: string;
  rivalHandle?: string;
}

// POST /api/blitz/sessions
router.post("/sessions", async (req: Request, res: Response) => {
  const body = req.body as CreateSessionBody | undefined;
  const mode = body?.mode;
  const handle = body?.handle?.trim();
  const rivalHandle = body?.rivalHandle?.trim();

  if ((mode !== "blitz" && mode !== "duel") || !handle) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "mode ('blitz'|'duel') and handle are required." });
  }
  if (mode === "duel" && !rivalHandle) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "rivalHandle is required for duel mode." });
  }

  try {
    const [catalog, meSubs, [meInfo]] = await Promise.all([
      getProblemset(),
      fetchUserStatus(handle),
      fetchUserInfo([handle]),
    ]);

    if (!meInfo) {
      return res.status(404).json({ error: "NOT_FOUND", message: `No Codeforces user "${handle}" found.` });
    }

    const meBaseline = meSubs[0]?.id ?? 0;
    const solvedKeys = new Set(meSubs.filter((s) => s.verdict === "OK").map((s) => problemKey(s.problem)));

    const handles = [meInfo.handle];
    const ratings: Record<string, number | null> = { [meInfo.handle.toLowerCase()]: meInfo.rating ?? null };
    const baselineSubmissionId: Record<string, number> = { [meInfo.handle.toLowerCase()]: meBaseline };

    let targets: number[];

    if (mode === "duel" && rivalHandle) {
      const [rivalSubs, [rivalInfo]] = await Promise.all([fetchUserStatus(rivalHandle), fetchUserInfo([rivalHandle])]);

      if (!rivalInfo) {
        return res.status(404).json({ error: "NOT_FOUND", message: `No Codeforces user "${rivalHandle}" found.` });
      }

      const rivalBaseline = rivalSubs[0]?.id ?? 0;
      for (const s of rivalSubs) {
        if (s.verdict === "OK") solvedKeys.add(problemKey(s.problem));
      }

      handles.push(rivalInfo.handle);
      ratings[rivalInfo.handle.toLowerCase()] = rivalInfo.rating ?? null;
      baselineSubmissionId[rivalInfo.handle.toLowerCase()] = rivalBaseline;
      targets = buildDuelTargets(effectiveRating({ rating: meInfo.rating }), effectiveRating({ rating: rivalInfo.rating }));
    } else {
      targets = buildSoloTargets(effectiveRating({ rating: meInfo.rating }));
    }

    const judgeableKeys = await getJudgeableKeys();
    const problems = selectProblems(catalog, targets, solvedKeys, judgeableKeys).map((p) => {
      const key = problemKey(p);
      return {
        ...p,
        covered: false, // will update below
        judgeable: judgeableKeys.has(key),
      };
    });

    const coveredFlags = await Promise.all(
      problems.map((p) => hasStatement(problemKey(p)))
    );
    const problemsWithCoverage = problems.map((p, i) => ({ ...p, covered: coveredFlags[i] }));

    const session = createSession(mode, handles, ratings, baselineSubmissionId, problemsWithCoverage);
    await saveSession(session);

    res.json({ session });
  } catch (e) {
    handleError(res, e);
  }
});

// GET /api/blitz/sessions/:id
router.get("/sessions/:id", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req.params.id as string);
    if (!session) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Session not found (it may have expired)." });
    }
    res.json({ session });
  } catch (error: any) {
    console.error("Get session error:", error);
    res.status(500).json({ error: "INTERNAL", message: error.message });
  }
});

// POST /api/blitz/sessions/:id/end
router.post("/sessions/:id/end", async (req: Request, res: Response) => {
  try {
    const session = await getSession(req.params.id as string);
    if (!session) {
      return res.status(404).json({ error: "NOT_FOUND", message: "Session not found." });
    }
    await deleteSession(req.params.id as string);
    res.status(204).end();
  } catch (error: any) {
    console.error("End session error:", error);
    res.status(500).json({ error: "INTERNAL", message: error.message });
  }
});

export default router;

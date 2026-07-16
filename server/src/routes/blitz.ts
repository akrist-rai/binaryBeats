import Router from "@koa/router";
import type { Context } from "koa";
import { CfApiError, fetchUserInfo, fetchUserStatus, problemKey } from "../codeforces.js";
import { getProblemset } from "../problemCache.js";
import { NoProblemsError, buildDuelTargets, buildSoloTargets, effectiveRating, selectProblems } from "../blitzAlgorithm.js";
import { createSession, type BlitzMode } from "../blitzSession.js";
import { deleteSession, getSession, saveSession } from "../sessionStore.js";
import { getJudgeableKeys, hasStatement } from "../problemDb.js";

const router = new Router({ prefix: "/api/blitz" });

function handleError(ctx: Context, e: unknown) {
  if (e instanceof NoProblemsError) {
    ctx.status = 409;
    ctx.body = { error: "NO_PROBLEMS", message: `Couldn't find enough unsolved problems near rating ${e.target}.` };
    return;
  }
  if (e instanceof CfApiError) {
    ctx.status = e.kind === "NOT_FOUND" ? 404 : e.kind === "RATE_LIMITED" ? 429 : 502;
    ctx.body = { error: e.kind, message: e.message };
    return;
  }
  ctx.status = 500;
  ctx.body = { error: "INTERNAL", message: "Unexpected server error." };
  console.error(e);
}

interface CreateSessionBody {
  mode?: BlitzMode;
  handle?: string;
  rivalHandle?: string;
}

router.post("/sessions", async (ctx) => {
  const body = ctx.request.body as CreateSessionBody | undefined;
  const mode = body?.mode;
  const handle = body?.handle?.trim();
  const rivalHandle = body?.rivalHandle?.trim();

  if ((mode !== "blitz" && mode !== "duel") || !handle) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "mode ('blitz'|'duel') and handle are required." };
    return;
  }
  if (mode === "duel" && !rivalHandle) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "rivalHandle is required for duel mode." };
    return;
  }

  try {
    const [catalog, meSubs, [meInfo]] = await Promise.all([
      getProblemset(),
      fetchUserStatus(handle),
      fetchUserInfo([handle]),
    ]);

    if (!meInfo) {
      ctx.status = 404;
      ctx.body = { error: "NOT_FOUND", message: `No Codeforces user "${handle}" found.` };
      return;
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
        ctx.status = 404;
        ctx.body = { error: "NOT_FOUND", message: `No Codeforces user "${rivalHandle}" found.` };
        return;
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
        covered: hasStatement(key), // sync check via cached set — OK to call without await here
        judgeable: judgeableKeys.has(key),
      };
    });

    // hasStatement needs to be awaited per problem — batch it
    const coveredFlags = await Promise.all(
      problems.map((p) => hasStatement(problemKey(p)))
    );
    const problemsWithCoverage = problems.map((p, i) => ({ ...p, covered: coveredFlags[i] }));

    const session = createSession(mode, handles, ratings, baselineSubmissionId, problemsWithCoverage);
    await saveSession(session);

    ctx.body = { session };
  } catch (e) {
    handleError(ctx, e);
  }
});

router.get("/sessions/:id", async (ctx) => {
  const session = await getSession(ctx.params.id);
  if (!session) {
    ctx.status = 404;
    ctx.body = { error: "NOT_FOUND", message: "Session not found (it may have expired)." };
    return;
  }
  ctx.body = { session };
});

router.post("/sessions/:id/end", async (ctx) => {
  const session = await getSession(ctx.params.id);
  if (!session) {
    ctx.status = 404;
    ctx.body = { error: "NOT_FOUND", message: "Session not found." };
    return;
  }
  await deleteSession(ctx.params.id);
  ctx.status = 204;
});

export default router;

import Router from "@koa/router";
import { problemKey } from "../codeforces.js";
import { getStatement, isJudgeable } from "../problemDb.js";
import { getSession } from "../sessionStore.js";
import { scheduleRun } from "../judge/judge.js";
import { createRun, getRun, JudgeBusyError, sweepFinishedRuns, type RunKind } from "../judge/runStore.js";

const router = new Router({ prefix: "/api/judge" });

const MAX_CODE_BYTES = 256 * 1024;
const MAX_STDIN_BYTES = 256 * 1024;

interface CreateRunBody {
  kind?: RunKind;
  code?: string;
  problemKey?: string;
  sessionId?: string;
  handle?: string;
  stdin?: string;
}

// POST /api/judge/runs — enqueue a compile+run job. 'submit' judges against the
// full official test suite and records an AC into the session; 'samples' checks
// the public examples; 'custom' is a plain run against provided stdin.
router.post("/runs", async (ctx) => {
  sweepFinishedRuns();
  const body = (ctx.request.body ?? {}) as CreateRunBody;
  const { kind, code, stdin } = body;

  if ((kind !== "submit" && kind !== "samples" && kind !== "custom") || typeof code !== "string" || code.length === 0) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "kind ('submit'|'samples'|'custom') and code are required." };
    return;
  }
  if (Buffer.byteLength(code, "utf8") > MAX_CODE_BYTES) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "Code exceeds the 256 KB limit." };
    return;
  }
  if (stdin !== undefined && Buffer.byteLength(stdin, "utf8") > MAX_STDIN_BYTES) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "stdin exceeds the 256 KB limit." };
    return;
  }

  let examples: { input: string; output: string }[] | undefined;
  let sessionId: string | undefined;
  let key: string | undefined;
  let handle: string | undefined;

  if (kind === "submit") {
    sessionId = body.sessionId;
    key = body.problemKey?.toUpperCase();
    if (!key) {
      ctx.status = 400;
      ctx.body = { error: "BAD_REQUEST", message: "problemKey is required for submit." };
      return;
    }

    // sessionId is optional — practice-mode submits judge against the full suite
    // the same way, they just have no session/handle to record a solve into.
    if (sessionId) {
      const session = await getSession(sessionId);
      if (!session) {
        ctx.status = 404;
        ctx.body = { error: "NOT_FOUND", message: "Session not found (it may have expired)." };
        return;
      }
      if (session.status !== "active") {
        ctx.status = 409;
        ctx.body = { error: "SESSION_FINISHED", message: "This session has already finished." };
        return;
      }
      if (!session.problems.some((p) => problemKey(p) === key)) {
        ctx.status = 404;
        ctx.body = { error: "NOT_FOUND", message: "That problem isn't part of this session." };
        return;
      }

      handle = (body.handle ?? session.handles[0]).toLowerCase();
      if (!session.handles.includes(handle)) {
        ctx.status = 400;
        ctx.body = { error: "BAD_REQUEST", message: "handle isn't part of this session." };
        return;
      }
    }

    if (!(await isJudgeable(key))) {
      ctx.status = 409;
      ctx.body = { error: "NOT_JUDGEABLE", message: "No complete local test suite for this problem — submit on Codeforces instead." };
      return;
    }
  }

  if (kind === "samples") {
    key = body.problemKey?.toUpperCase();
    if (!key) {
      ctx.status = 400;
      ctx.body = { error: "BAD_REQUEST", message: "problemKey is required for samples." };
      return;
    }
    const statement = await getStatement(key);
    if (!statement || statement.examples.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "NOT_FOUND", message: "No examples available for this problem." };
      return;
    }
    examples = statement.examples;
  }

  try {
    const run = createRun({ kind, sessionId, problemKey: key, handle });
    scheduleRun(run, code, stdin, examples);
    ctx.status = 202;
    ctx.body = { runId: run.id };
  } catch (e) {
    if (e instanceof JudgeBusyError) {
      ctx.status = 429;
      ctx.body = { error: "JUDGE_BUSY", message: e.message };
      return;
    }
    throw e;
  }
});

// GET /api/judge/runs/:id — poll a run's state/progress/result.
router.get("/runs/:id", async (ctx) => {
  const run = getRun(ctx.params.id);
  if (!run) {
    ctx.status = 404;
    ctx.body = { error: "NOT_FOUND", message: "Run not found (results are kept for 10 minutes)." };
    return;
  }
  ctx.body = { run };
});

export default router;

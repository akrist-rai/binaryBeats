import Router from "@koa/router";
import type { Context } from "koa";
import { CfApiError, fetchUserInfo, fetchUserStatus } from "../codeforces.js";
import { getProblemset } from "../problemCache.js";

const router = new Router({ prefix: "/api/cf" });

function handleCfError(ctx: Context, e: unknown) {
  if (e instanceof CfApiError) {
    ctx.status = e.kind === "NOT_FOUND" ? 404 : e.kind === "RATE_LIMITED" ? 429 : 502;
    ctx.body = { error: e.kind, message: e.message };
    return;
  }
  ctx.status = 500;
  ctx.body = { error: "INTERNAL", message: "Unexpected server error." };
}

// GET /api/cf/user/:handles — semicolon-separated handles, e.g. /user/tourist;Um_nik
router.get("/user/:handles", async (ctx) => {
  const handles = ctx.params.handles.split(";").map((h) => h.trim()).filter(Boolean);
  if (handles.length === 0) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "At least one handle is required." };
    return;
  }

  try {
    const users = await fetchUserInfo(handles);
    ctx.body = {
      users: users.map((u) => ({
        handle: u.handle,
        rating: u.rating ?? null,
        maxRating: u.maxRating ?? null,
        rank: u.rank ?? null,
      })),
    };
  } catch (e) {
    handleCfError(ctx, e);
  }
});

// GET /api/cf/problemset — the full rated-problem catalog, cached & trimmed server-side
router.get("/problemset", async (ctx) => {
  try {
    ctx.body = { problems: await getProblemset() };
  } catch (e) {
    handleCfError(ctx, e);
  }
});

// GET /api/cf/status/:handle?count=N — a handle's submission history, trimmed to what
// the Blitz & Duel verdict-detection logic actually needs.
router.get("/status/:handle", async (ctx) => {
  const { handle } = ctx.params;
  const countParam = ctx.query.count;
  const count = typeof countParam === "string" && countParam ? Number(countParam) : undefined;

  try {
    const submissions = await fetchUserStatus(handle, count);
    ctx.body = {
      submissions: submissions.map((s) => ({
        id: s.id,
        creationTimeSeconds: s.creationTimeSeconds,
        verdict: s.verdict ?? null,
        problem: { contestId: s.problem.contestId, index: s.problem.index },
      })),
    };
  } catch (e) {
    handleCfError(ctx, e);
  }
});

export default router;

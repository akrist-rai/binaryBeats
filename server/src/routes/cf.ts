import Router from "@koa/router";
import type { Context } from "koa";
import { CfApiError, fetchUserInfo, fetchUserRating, fetchUserStatus } from "../codeforces.js";

const RATING_HISTORY_LIMIT = 20;
const RATING_HISTORY_TTL_MS = 5 * 60 * 1000;

interface RatingHistoryEntry {
  contestId: number;
  contestName: string;
  newRating: number;
  oldRating: number;
  ratingUpdateTimeSeconds: number;
}

// Small per-handle cache — avoids re-fetching a handle's whole rating history
// (which can be hundreds of entries for prolific users) on every dashboard visit.
const ratingHistoryCache = new Map<string, { fetchedAt: number; history: RatingHistoryEntry[] }>();

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

// GET /api/cf/user/:handle/rating-history — a handle's real contest-by-contest
// rating changes, newest last, trimmed to the most recent entries.
router.get("/user/:handle/rating-history", async (ctx) => {
  const key = ctx.params.handle.toLowerCase();
  const cached = ratingHistoryCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < RATING_HISTORY_TTL_MS) {
    ctx.body = { history: cached.history };
    return;
  }

  try {
    const changes = await fetchUserRating(ctx.params.handle);
    const recent: RatingHistoryEntry[] = changes.slice(-RATING_HISTORY_LIMIT).map((c) => ({
      contestId: c.contestId,
      contestName: c.contestName,
      newRating: c.newRating,
      oldRating: c.oldRating,
      ratingUpdateTimeSeconds: c.ratingUpdateTimeSeconds,
    }));
    ratingHistoryCache.set(key, { fetchedAt: Date.now(), history: recent });
    ctx.body = { history: recent };
  } catch (e) {
    handleCfError(ctx, e);
  }
});

export default router;

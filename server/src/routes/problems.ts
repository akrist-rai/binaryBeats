import Router from "@koa/router";
import { getStatement, listProblems } from "../problemDb.js";

const router = new Router({ prefix: "/api/problems" });

const KEY_RE = /^\d+-[A-Z0-9]+$/i;

// GET /api/problems/:key/statement — full statement + examples from Neon.
// Official tests, checker source, and editorial never leave the server.
router.get("/:key/statement", async (ctx) => {
  const key = ctx.params.key.toUpperCase();
  if (!KEY_RE.test(key)) {
    ctx.status = 400;
    ctx.body = { error: "BAD_REQUEST", message: "Invalid problem key." };
    return;
  }

  const problem = await getStatement(key);
  if (!problem) {
    ctx.status = 404;
    ctx.body = { error: "NOT_COVERED", message: "This problem isn't in the database." };
    return;
  }

  ctx.set("Cache-Control", "public, max-age=3600");
  ctx.body = { problem };
});

// GET /api/problems — paginated problem list for the Problems tab.
// Query params: search, tags (comma-separated), ratingMin, ratingMax,
//               difficulty (easy|medium|hard), page, pageSize
router.get("/", async (ctx) => {
  const q = ctx.query;

  const search = typeof q.search === "string" && q.search.trim() ? q.search.trim() : undefined;
  const tags =
    typeof q.tags === "string" && q.tags.trim()
      ? q.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : undefined;
  const ratingMin = typeof q.ratingMin === "string" ? Number(q.ratingMin) || undefined : undefined;
  const ratingMax = typeof q.ratingMax === "string" ? Number(q.ratingMax) || undefined : undefined;
  const difficulty =
    typeof q.difficulty === "string" && ["easy", "medium", "hard"].includes(q.difficulty)
      ? (q.difficulty as "easy" | "medium" | "hard")
      : undefined;
  const page = typeof q.page === "string" ? Math.max(1, parseInt(q.page) || 1) : 1;
  const pageSize = typeof q.pageSize === "string" ? Math.min(100, parseInt(q.pageSize) || 50) : 50;

  const result = await listProblems({ search, tags, ratingMin, ratingMax, difficulty, page, pageSize });

  ctx.set("Cache-Control", "public, max-age=60");
  ctx.body = result;
});

export default router;

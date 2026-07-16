/**
 * Problem data access layer — now backed by Neon (PostgreSQL) via Drizzle ORM.
 * Public API is unchanged from the SQLite version so route files need no edits.
 *
 * All functions are now async. The route files that call them must await.
 */
import { gunzipSync } from "node:zlib";
import { eq, and, sql, ilike, gte, lte, inArray } from "drizzle-orm";
import { db } from "./db/index.js";
import { problems, tests } from "./db/schema.js";

export interface ProblemStatement {
  key: string;
  contestId: number;
  index: string;
  title: string | null;
  rating: number | null;
  tags: string[];
  timeLimitMs: number | null;
  memoryLimitMb: number | null;
  description: string | null;
  inputFormat: string | null;
  outputFormat: string | null;
  note: string | null;
  examples: { input: string; output: string }[];
  interactive: boolean;
  judgeable: boolean;
  /** Count of official hidden tests Submit judges against — 0 when not judgeable.
   *  Never the test content itself, that stays server-side. */
  testCount: number;
}

export interface JudgeInfo {
  timeLimitMs: number;
  memoryLimitMb: number;
  testCount: number;
  hasChecker: boolean;
}

export interface ProblemListResult {
  problems: ProblemStatement[];
  total: number;
  page: number;
  pages: number;
}

function rowIsJudgeable(row: { testsComplete: boolean; interactive: boolean; hasChecker: boolean }): boolean {
  return row.testsComplete && !row.interactive && !row.hasChecker;
}

function toStatement(row: typeof problems.$inferSelect): ProblemStatement {
  return {
    key: row.problemKey,
    contestId: row.contestId,
    index: row.problemIndex,
    title: row.title,
    rating: row.rating,
    tags: (row.tags as string[]) ?? [],
    timeLimitMs: row.timeLimitMs,
    memoryLimitMb: row.memoryLimitMb,
    description: row.description,
    inputFormat: row.inputFormat,
    outputFormat: row.outputFormat,
    note: row.note,
    examples: (row.examples as { input: string; output: string }[]) ?? [],
    interactive: row.interactive,
    judgeable: rowIsJudgeable(row),
    testCount: rowIsJudgeable(row) ? row.testCount : 0,
  };
}

export async function getStatement(key: string): Promise<ProblemStatement | undefined> {
  const rows = await db
    .select()
    .from(problems)
    .where(eq(problems.problemKey, key.toUpperCase()))
    .limit(1);
  if (!rows[0]) return undefined;
  return toStatement(rows[0]);
}

export async function getJudgeInfo(key: string): Promise<JudgeInfo | undefined> {
  const rows = await db
    .select({
      timeLimitMs: problems.timeLimitMs,
      memoryLimitMb: problems.memoryLimitMb,
      testCount: problems.testCount,
      hasChecker: problems.hasChecker,
      testsComplete: problems.testsComplete,
      interactive: problems.interactive,
    })
    .from(problems)
    .where(eq(problems.problemKey, key.toUpperCase()))
    .limit(1);

  const row = rows[0];
  if (!row || !rowIsJudgeable(row)) return undefined;
  return {
    timeLimitMs: row.timeLimitMs ?? 2000,
    memoryLimitMb: row.memoryLimitMb ?? 256,
    testCount: row.testCount,
    hasChecker: row.hasChecker,
  };
}

/** Fetch and decompress a single official test. */
export async function getTest(key: string, index: number): Promise<{ input: string; output: string } | undefined> {
  const rows = await db
    .select({ input: tests.input, output: tests.output })
    .from(tests)
    .where(and(eq(tests.problemKey, key.toUpperCase()), eq(tests.testIndex, index)))
    .limit(1);

  const row = rows[0];
  if (!row) return undefined;
  return {
    input: gunzipSync(row.input as Buffer).toString("utf8"),
    output: gunzipSync(row.output as Buffer).toString("utf8"),
  };
}

// ── Judgeable key set — cached for 60 s to avoid hot-path DB round-trips ──────

let judgeableKeysCache: Set<string> | null = null;
let judgeableKeysCachedAt = 0;
const CACHE_TTL_MS = 60_000;

export async function getJudgeableKeys(): Promise<Set<string>> {
  const now = Date.now();
  if (judgeableKeysCache && now - judgeableKeysCachedAt < CACHE_TTL_MS) {
    return judgeableKeysCache;
  }
  const rows = await db
    .select({ problemKey: problems.problemKey })
    .from(problems)
    .where(and(eq(problems.testsComplete, true), eq(problems.interactive, false), eq(problems.hasChecker, false)));

  judgeableKeysCache = new Set(rows.map((r) => r.problemKey));
  judgeableKeysCachedAt = now;
  return judgeableKeysCache;
}

export async function isJudgeable(key: string): Promise<boolean> {
  const keys = await getJudgeableKeys();
  return keys.has(key.toUpperCase());
}

export async function hasStatement(key: string): Promise<boolean> {
  const rows = await db
    .select({ problemKey: problems.problemKey })
    .from(problems)
    .where(eq(problems.problemKey, key.toUpperCase()))
    .limit(1);
  return rows.length > 0;
}

// ── Paginated problem list for the Problems tab ────────────────────────────────

export interface ListProblemsOptions {
  search?: string;
  tags?: string[];       // filter must-include all tags
  ratingMin?: number;
  ratingMax?: number;
  difficulty?: "easy" | "medium" | "hard"; // mapped to rating ranges
  page?: number;
  pageSize?: number;
}

/** Codeforces difficulty band mapping (roughly). */
const DIFFICULTY_RANGES: Record<string, { min: number; max: number }> = {
  easy:   { min: 800,  max: 1300 },
  medium: { min: 1301, max: 1900 },
  hard:   { min: 1901, max: 3500 },
};

export async function listProblems(opts: ListProblemsOptions = {}): Promise<ProblemListResult> {
  const pageSize = Math.min(opts.pageSize ?? 50, 100);
  const page = Math.max(opts.page ?? 1, 1);
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [
    // Only show problems that have at least a statement (description not null)
    sql`${problems.description} IS NOT NULL`,
  ];

  if (opts.search) {
    conditions.push(ilike(problems.title, `%${opts.search}%`));
  }

  if (opts.difficulty && DIFFICULTY_RANGES[opts.difficulty]) {
    const { min, max } = DIFFICULTY_RANGES[opts.difficulty];
    conditions.push(gte(problems.rating, min));
    conditions.push(lte(problems.rating, max));
  } else {
    if (opts.ratingMin !== undefined) conditions.push(gte(problems.rating, opts.ratingMin));
    if (opts.ratingMax !== undefined) conditions.push(lte(problems.rating, opts.ratingMax));
  }

  // Tag filtering — check JSON array containment using PostgreSQL @> operator
  if (opts.tags && opts.tags.length > 0) {
    for (const tag of opts.tags) {
      conditions.push(sql`${problems.tags} @> ${JSON.stringify([tag])}::jsonb`);
    }
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, countResult] = await Promise.all([
    db
      .select()
      .from(problems)
      .where(where)
      .orderBy(problems.rating, problems.contestId)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(problems)
      .where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    problems: rows.map(toStatement),
    total,
    page,
    pages: Math.ceil(total / pageSize),
  };
}

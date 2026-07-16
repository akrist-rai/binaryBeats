/**
 * Session store — backed by Neon (PostgreSQL) via Drizzle ORM.
 * Replaces the previous in-memory Map. All functions are now async.
 */
import { eq, sql } from "drizzle-orm";
import { db } from "./db/index.js";
import { blitzSessions } from "./db/schema.js";
import type { BlitzSession } from "./blitzSession.js";
import type { SessionProblem } from "./blitzAlgorithm.js";

// ── helpers ───────────────────────────────────────────────────────────────────

function rowToSession(row: typeof blitzSessions.$inferSelect): BlitzSession {
  return {
    id: row.id,
    mode: row.mode as BlitzSession["mode"],
    handles: row.handles as string[],
    displayHandles: row.displayHandles as Record<string, string>,
    ratings: row.ratings as Record<string, number | null>,
    baselineSubmissionId: row.baselineSubmissionId as Record<string, number>,
    problems: row.problems as SessionProblem[],
    results: row.results as Record<string, Record<string, number>>,
    solveSources: (row.solveSources ?? undefined) as BlitzSession["solveSources"],
    status: row.status as BlitzSession["status"],
    createdAtSeconds: row.createdAtSeconds,
    finishedAtSeconds: row.finishedAtSeconds ?? undefined,
  };
}

function sessionToRow(session: BlitzSession): typeof blitzSessions.$inferInsert {
  return {
    id: session.id,
    mode: session.mode,
    handles: session.handles,
    displayHandles: session.displayHandles,
    ratings: session.ratings,
    baselineSubmissionId: session.baselineSubmissionId,
    problems: session.problems as object[],
    results: session.results,
    solveSources: session.solveSources ?? null,
    status: session.status,
    createdAtSeconds: session.createdAtSeconds,
    finishedAtSeconds: session.finishedAtSeconds ?? null,
  };
}

// ── public API ─────────────────────────────────────────────────────────────────

export async function saveSession(session: BlitzSession): Promise<void> {
  await db
    .insert(blitzSessions)
    .values(sessionToRow(session))
    .onConflictDoUpdate({
      target: blitzSessions.id,
      set: {
        results: sql`excluded.results`,
        solveSources: sql`excluded.solve_sources`,
        status: sql`excluded.status`,
        finishedAtSeconds: sql`excluded.finished_at_seconds`,
        problems: sql`excluded.problems`,
      },
    });
}

export async function getSession(id: string): Promise<BlitzSession | undefined> {
  const rows = await db
    .select()
    .from(blitzSessions)
    .where(eq(blitzSessions.id, id))
    .limit(1);
  return rows[0] ? rowToSession(rows[0]) : undefined;
}

export async function deleteSession(id: string): Promise<void> {
  await db.delete(blitzSessions).where(eq(blitzSessions.id, id));
}

export async function listActiveSessions(): Promise<BlitzSession[]> {
  const rows = await db
    .select()
    .from(blitzSessions)
    .where(eq(blitzSessions.status, "active"));
  return rows.map(rowToSession);
}

export async function sweepStaleSessions(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  const maxAgeS = 6 * 60 * 60;         // 6 h since creation
  const finishedRetentionS = 30 * 60;  // 30 min after finishing

  await db
    .delete(blitzSessions)
    .where(
      sql`(${blitzSessions.createdAtSeconds} < ${now - maxAgeS})
       OR (${blitzSessions.status} = 'finished'
           AND ${blitzSessions.finishedAtSeconds} IS NOT NULL
           AND ${blitzSessions.finishedAtSeconds} < ${now - finishedRetentionS})`
    );
}

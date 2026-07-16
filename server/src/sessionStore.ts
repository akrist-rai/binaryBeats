import type { BlitzSession } from "./blitzSession.js";

const sessions = new Map<string, BlitzSession>();

// Housekeeping so an abandoned/forgotten session doesn't sit in memory forever.
const MAX_SESSION_AGE_MS = 6 * 60 * 60 * 1000; // 6h since creation, regardless of status
const FINISHED_RETENTION_MS = 30 * 60 * 1000; // 30min after finishing, so a client can still fetch the result

export function saveSession(session: BlitzSession): void {
  sessions.set(session.id, session);
}

export function getSession(id: string): BlitzSession | undefined {
  return sessions.get(id);
}

export function deleteSession(id: string): void {
  sessions.delete(id);
}

export function listActiveSessions(): BlitzSession[] {
  return [...sessions.values()].filter((s) => s.status === "active");
}

export function sweepStaleSessions(): void {
  const now = Date.now();
  for (const session of sessions.values()) {
    const ageMs = now - session.createdAtSeconds * 1000;
    const finishedAgeMs = session.finishedAtSeconds ? now - session.finishedAtSeconds * 1000 : 0;
    if (ageMs > MAX_SESSION_AGE_MS || (session.status === "finished" && finishedAgeMs > FINISHED_RETENTION_MS)) {
      sessions.delete(session.id);
    }
  }
}

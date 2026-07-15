import type { SessionProblem } from "./blitzAlgorithm";
import { problemKey } from "./codeforces";

export type BlitzMode = "blitz" | "duel";

export interface BlitzSession {
  id: string;
  mode: BlitzMode;
  createdAtSeconds: number;
  /** Lowercased handles: [me] for solo, [me, rival] for duel. Used as the canonical key everywhere. */
  handles: string[];
  /** Lowercased handle -> the canonically-cased handle, for display only. */
  displayHandles: Record<string, string>;
  ratings: Record<string, number | null>;
  /** Newest submission id seen per handle at session creation — only submissions with a
   *  higher id than this count as a "solve" for this session. */
  baselineSubmissionId: Record<string, number>;
  problems: SessionProblem[];
  /** handle -> problemKey -> accepted-at (epoch seconds) */
  results: Record<string, Record<string, number>>;
  /** problemKey (or the literal "duel_bonus") -> true, once XP has been paid for it */
  xpAwarded: Record<string, true>;
  status: "active" | "finished";
  finishedAtSeconds?: number;
}

const SESSION_KEY = "bb_blitz_session_v1";

export function createSession(
  mode: BlitzMode,
  handles: string[],
  ratings: Record<string, number | null>,
  baselineSubmissionId: Record<string, number>,
  problems: SessionProblem[]
): BlitzSession {
  const lowerHandles = handles.map((h) => h.toLowerCase());
  return {
    id: crypto.randomUUID(),
    mode,
    createdAtSeconds: Math.floor(Date.now() / 1000),
    handles: lowerHandles,
    displayHandles: Object.fromEntries(handles.map((h) => [h.toLowerCase(), h])),
    ratings,
    baselineSubmissionId,
    problems,
    results: Object.fromEntries(lowerHandles.map((h) => [h, {}])),
    xpAwarded: {},
    status: "active",
  };
}

export function recordSolve(session: BlitzSession, handle: string, key: string, acTimeSeconds: number): BlitzSession {
  const h = handle.toLowerCase();
  const existing = session.results[h]?.[key];
  if (existing !== undefined && existing <= acTimeSeconds) return session;

  return {
    ...session,
    results: {
      ...session.results,
      [h]: { ...session.results[h], [key]: acTimeSeconds },
    },
  };
}

export function markXpAwarded(session: BlitzSession, key: string): BlitzSession {
  if (session.xpAwarded[key]) return session;
  return { ...session, xpAwarded: { ...session.xpAwarded, [key]: true } };
}

export function hasXpAwarded(session: BlitzSession, key: string): boolean {
  return !!session.xpAwarded[key];
}

/** For duel mode: whichever handle has the earliest accepted-at time claims the problem. */
export function claimedBy(session: BlitzSession, key: string): string | null {
  let winner: string | null = null;
  let winnerTime = Infinity;
  for (const handle of session.handles) {
    const t = session.results[handle]?.[key];
    if (t !== undefined && t < winnerTime) {
      winner = handle;
      winnerTime = t;
    }
  }
  return winner;
}

/** Count of problems claimed/solved per handle. */
export function scores(session: BlitzSession): Record<string, number> {
  const out: Record<string, number> = Object.fromEntries(session.handles.map((h) => [h, 0]));
  for (const p of session.problems) {
    const key = problemKey(p);
    if (session.mode === "duel") {
      const winner = claimedBy(session, key);
      if (winner) out[winner] += 1;
    } else {
      for (const handle of session.handles) {
        if (session.results[handle]?.[key] !== undefined) out[handle] += 1;
      }
    }
  }
  return out;
}

export function isComplete(session: BlitzSession): boolean {
  if (session.mode === "duel") {
    return session.problems.every((p) => claimedBy(session, problemKey(p)) !== null);
  }
  const me = session.handles[0];
  return session.problems.every((p) => session.results[me]?.[problemKey(p)] !== undefined);
}

export function finishSession(session: BlitzSession): BlitzSession {
  if (session.status === "finished") return session;
  return { ...session, status: "finished", finishedAtSeconds: Math.floor(Date.now() / 1000) };
}

export function saveSession(session: BlitzSession | null): void {
  try {
    if (session === null) {
      localStorage.removeItem(SESSION_KEY);
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Storage unavailable — session simply won't survive a refresh.
  }
}

export function loadSession(): BlitzSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BlitzSession;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.problems)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  saveSession(null);
}

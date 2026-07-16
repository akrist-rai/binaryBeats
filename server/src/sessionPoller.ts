import { fetchUserStatus, problemKey } from "./codeforces.js";
import { finishSession, isComplete, recordSolve } from "./blitzSession.js";
import { getSession, listActiveSessions, saveSession, sweepStaleSessions } from "./sessionStore.js";

const POLL_INTERVAL_MS = 12_000;

async function pollSession(sessionId: string): Promise<void> {
  const initial = getSession(sessionId);
  if (!initial || initial.status !== "active") return;

  const problemKeys = new Set(initial.problems.map((p) => problemKey(p)));

  for (const handle of initial.handles) {
    // Re-read before each handle in case a prior handle in this same tick already
    // mutated the session (recordSolve returns a new object, doesn't mutate in place).
    const current = getSession(sessionId);
    if (!current || current.status !== "active") return;

    try {
      const submissions = await fetchUserStatus(handle, 30);
      const baseline = current.baselineSubmissionId[handle] ?? 0;
      let updated = current;

      for (const sub of submissions) {
        if (sub.verdict !== "OK") continue;
        if (sub.id <= baseline) continue;
        const key = problemKey(sub.problem);
        if (!problemKeys.has(key)) continue;
        updated = recordSolve(updated, handle, key, sub.creationTimeSeconds);
      }

      if (updated !== current) saveSession(updated);
    } catch (e) {
      console.error(`[poller] session ${sessionId} handle ${handle}:`, e instanceof Error ? e.message : e);
    }
  }

  const finalState = getSession(sessionId);
  if (finalState && finalState.status === "active" && isComplete(finalState)) {
    saveSession(finishSession(finalState));
  }
}

let pollInProgress = false;

async function tick(): Promise<void> {
  if (pollInProgress) return;
  pollInProgress = true;
  try {
    sweepStaleSessions();
    for (const session of listActiveSessions()) {
      await pollSession(session.id);
    }
  } finally {
    pollInProgress = false;
  }
}

/** Starts the background loop that keeps checking Codeforces for active sessions'
 *  solves — this is what lets a session keep progressing even while every
 *  browser tab that cares about it is closed. */
export function startSessionPoller(): void {
  setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);
}

import { fetchUserStatus, problemKey } from "./codeforces.js";
import { finishSession, isComplete, recordSolve } from "./blitzSession.js";
import { getSession, listActiveSessions, saveSession, sweepStaleSessions } from "./sessionStore.js";

const POLL_INTERVAL_MS = 12_000;

async function pollSession(sessionId: string): Promise<void> {
  const initial = await getSession(sessionId);
  if (!initial || initial.status !== "active") return;

  const problemKeys = new Set(initial.problems.map((p) => problemKey(p)));

  for (const handle of initial.handles) {
    const current = await getSession(sessionId);
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

      if (updated !== current) await saveSession(updated);
    } catch (e) {
      console.error(`[poller] session ${sessionId} handle ${handle}:`, e instanceof Error ? e.message : e);
    }
  }

  const finalState = await getSession(sessionId);
  if (finalState && finalState.status === "active" && isComplete(finalState)) {
    await saveSession(finishSession(finalState));
  }
}

let pollInProgress = false;

async function tick(): Promise<void> {
  if (pollInProgress) return;
  pollInProgress = true;
  try {
    await sweepStaleSessions();
    for (const session of await listActiveSessions()) {
      await pollSession(session.id);
    }
  } finally {
    pollInProgress = false;
  }
}

export function startSessionPoller(): void {
  setInterval(() => {
    void tick();
  }, POLL_INTERVAL_MS);
}

import { useEffect, useRef, useState } from "react";
import { fetchUserStatus, problemKey } from "../lib/codeforces";
import type { BlitzSession } from "../lib/blitzSession";

export type PollState = "live" | "paused" | "backoff";

const BASE_INTERVAL_MS = 15_000;
const MAX_INTERVAL_MS = 60_000;
const STATUS_FETCH_COUNT = 30;

export interface VerdictPollingInfo {
  pollState: PollState;
  lastCheckedAt: number | null;
}

/**
 * Polls each handle in the active session for new Accepted submissions matching
 * the session's problem set, and reports them via onSolve. Paused while the tab
 * is hidden (to respect Codeforces' rate limits), with an immediate check on
 * tab focus/visibility so a just-submitted solve is picked up right away.
 */
export function useVerdictPolling(
  session: BlitzSession | null,
  onSolve: (handle: string, key: string, acTimeSeconds: number) => void
): VerdictPollingInfo {
  const [pollState, setPollState] = useState<PollState>("live");
  const [lastCheckedAt, setLastCheckedAt] = useState<number | null>(null);

  const sessionRef = useRef(session);
  sessionRef.current = session;
  const onSolveRef = useRef(onSolve);
  onSolveRef.current = onSolve;

  useEffect(() => {
    if (!session || session.status !== "active") return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let intervalMs = BASE_INTERVAL_MS;
    let inFlight = false;

    const problemKeys = new Set(session.problems.map((p) => problemKey(p)));

    function scheduleNext() {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(tick, intervalMs);
    }

    async function tick() {
      if (cancelled || inFlight) return;
      if (document.visibilityState !== "visible") {
        setPollState("paused");
        return;
      }

      const current = sessionRef.current;
      if (!current) return;

      inFlight = true;
      try {
        for (const handle of current.handles) {
          const submissions = await fetchUserStatus(handle, STATUS_FETCH_COUNT);
          const baseline = current.baselineSubmissionId[handle] ?? 0;
          for (const sub of submissions) {
            if (sub.verdict !== "OK") continue;
            if (sub.id <= baseline) continue;
            const key = problemKey(sub.problem);
            if (!problemKeys.has(key)) continue;
            onSolveRef.current(handle, key, sub.creationTimeSeconds);
          }
        }
        if (cancelled) return;
        intervalMs = BASE_INTERVAL_MS;
        setPollState("live");
        setLastCheckedAt(Date.now());
      } catch {
        if (cancelled) return;
        intervalMs = Math.min(intervalMs * 2, MAX_INTERVAL_MS);
        setPollState("backoff");
      } finally {
        inFlight = false;
        if (!cancelled) scheduleNext();
      }
    }

    function handleWake() {
      if (document.visibilityState === "visible") tick();
    }

    document.addEventListener("visibilitychange", handleWake);
    window.addEventListener("focus", handleWake);

    tick();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleWake);
      window.removeEventListener("focus", handleWake);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.status]);

  return { pollState, lastCheckedAt };
}

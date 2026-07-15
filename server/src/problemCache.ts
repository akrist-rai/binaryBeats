import { fetchProblemset } from "./codeforces.js";

export interface OptimizedProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
}

const TTL_MS = 24 * 60 * 60 * 1000;

let cache: { fetchedAt: number; problems: OptimizedProblem[] } | null = null;
let inFlight: Promise<OptimizedProblem[]> | null = null;

/**
 * Fetches Codeforces' full ~9000-problem catalog, trims it to just what the
 * Blitz & Duel algorithm needs (drops tags/points/type/etc.), and caches the
 * result in memory for every client this server serves — one shared fetch
 * instead of one per browser tab.
 */
export async function getProblemset(): Promise<OptimizedProblem[]> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache.problems;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    try {
      const raw = await fetchProblemset();
      const trimmed: OptimizedProblem[] = raw
        .filter((p): p is typeof p & { rating: number } => p.type === "PROGRAMMING" && typeof p.rating === "number")
        .map((p) => ({ contestId: p.contestId, index: p.index, name: p.name, rating: p.rating }));

      cache = { fetchedAt: Date.now(), problems: trimmed };
      return trimmed;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}

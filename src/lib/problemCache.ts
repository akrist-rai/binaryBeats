import { fetchProblemset } from "./codeforces";

export interface CachedProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
}

interface CacheShape {
  fetchedAt: number;
  problems: CachedProblem[];
}

const CACHE_KEY = "bb_cf_problems_v1";
const TTL_MS = 24 * 60 * 60 * 1000;

let memoryCache: CachedProblem[] | null = null;

function readLocalStorage(): CacheShape | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheShape;
    if (Date.now() - parsed.fetchedAt >= TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalStorage(problems: CachedProblem[]) {
  try {
    const payload: CacheShape = { fetchedAt: Date.now(), problems };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Quota exceeded or storage unavailable — proceed with in-memory cache only.
  }
}

export async function getProblemset(): Promise<CachedProblem[]> {
  if (memoryCache) return memoryCache;

  const cached = readLocalStorage();
  if (cached) {
    memoryCache = cached.problems;
    return memoryCache;
  }

  const raw = await fetchProblemset();
  const trimmed: CachedProblem[] = raw
    .filter(
      (p): p is typeof p & { rating: number } =>
        p.type === "PROGRAMMING" && typeof p.rating === "number" && typeof p.contestId === "number"
    )
    .map((p) => ({ contestId: p.contestId, index: p.index, name: p.name, rating: p.rating }));

  memoryCache = trimmed;
  writeLocalStorage(trimmed);
  return trimmed;
}

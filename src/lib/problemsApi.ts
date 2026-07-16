// Client for the backend's local-dataset problem statements
// (server/src/routes/problems.ts). Statements come from the open-r1/codeforces
// dataset (ODC-By 4.0) ingested into a server-side SQLite DB — official test
// cases never reach the browser.

export interface ProblemStatementData {
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
}

export class ProblemsApiError extends Error {
  kind: "NOT_COVERED" | "NETWORK" | "API_FAILED";

  constructor(kind: ProblemsApiError["kind"], message: string) {
    super(message);
    this.name = "ProblemsApiError";
    this.kind = kind;
  }
}

const cache = new Map<string, ProblemStatementData>();

export async function fetchStatement(key: string): Promise<ProblemStatementData> {
  const cached = cache.get(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(`/api/problems/${encodeURIComponent(key)}/statement`);
  } catch {
    throw new ProblemsApiError("NETWORK", "Could not reach the Binary Beats API.");
  }

  if (res.status === 404) {
    throw new ProblemsApiError("NOT_COVERED", "This problem isn't in the local dataset.");
  }
  if (!res.ok) {
    throw new ProblemsApiError("API_FAILED", `Statement request failed (${res.status}).`);
  }

  const { problem } = (await res.json()) as { problem: ProblemStatementData };
  cache.set(key, problem);
  return problem;
}

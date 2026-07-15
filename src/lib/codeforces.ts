// Client for OUR OWN backend (server/, a small Koa API), which in turn talks to
// the public Codeforces API. The backend centralizes rate-limiting, caching,
// and payload trimming so every browser tab isn't independently hammering
// Codeforces or re-fetching the ~9000-problem catalog.

export interface CfUser {
  handle: string;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
}

export interface CfProblem {
  contestId: number;
  index: string;
  name: string;
  rating: number;
}

export interface CfSubmission {
  id: number;
  creationTimeSeconds: number;
  verdict: string | null;
  problem: { contestId: number; index: string };
}

export type CfErrorKind = "NOT_FOUND" | "RATE_LIMITED" | "API_FAILED" | "NETWORK";

export class CfApiError extends Error {
  kind: CfErrorKind;

  constructor(kind: CfErrorKind, message: string) {
    super(message);
    this.name = "CfApiError";
    this.kind = kind;
  }
}

// Relative — proxied to the Koa backend (server/) by Vite's dev-server proxy.
const API_BASE = "/api/cf";

function classifyStatus(status: number): CfErrorKind {
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMITED";
  return "API_FAILED";
}

async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new CfApiError("NETWORK", "Could not reach the Binary Beats API.");
  }

  let body: { error?: string; message?: string } & Partial<T>;
  try {
    body = await res.json();
  } catch {
    throw new CfApiError("NETWORK", "The Binary Beats API returned an unreadable response.");
  }

  if (!res.ok) {
    throw new CfApiError(classifyStatus(res.status), body.message || "Request failed.");
  }

  return body as T;
}

export function isValidHandleFormat(handle: string): boolean {
  return /^[A-Za-z0-9_.-]{2,24}$/.test(handle.trim());
}

export async function fetchUserInfo(handles: string[]): Promise<CfUser[]> {
  const { users } = await apiGet<{ users: CfUser[] }>(`/user/${handles.map(encodeURIComponent).join(";")}`);
  return users;
}

export async function fetchProblemset(): Promise<CfProblem[]> {
  const { problems } = await apiGet<{ problems: CfProblem[] }>("/problemset");
  return problems;
}

export async function fetchUserStatus(handle: string, count?: number): Promise<CfSubmission[]> {
  const qs = count ? `?count=${count}` : "";
  const { submissions } = await apiGet<{ submissions: CfSubmission[] }>(`/status/${encodeURIComponent(handle)}${qs}`);
  return submissions;
}

export function problemKey(p: { contestId: number; index: string }): string {
  return `${p.contestId}-${p.index}`;
}

export function problemUrl(p: { contestId: number; index: string }): string {
  return `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
}

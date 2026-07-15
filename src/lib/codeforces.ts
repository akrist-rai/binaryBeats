// Thin client for the public Codeforces API (https://codeforces.com/apiHelp).
// All endpoints used here are CORS-enabled and require no API key.

export interface CfUser {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
  avatar?: string;
  titlePhoto?: string;
}

export interface CfProblem {
  contestId: number;
  index: string;
  name: string;
  rating?: number;
  tags: string[];
  type: string;
}

export interface CfSubmission {
  id: number;
  creationTimeSeconds: number;
  problem: CfProblem;
  verdict?: string;
}

export type CfErrorKind = "NOT_FOUND" | "RATE_LIMITED" | "API_FAILED" | "NETWORK";

export class CfApiError extends Error {
  kind: CfErrorKind;
  comment?: string;

  constructor(kind: CfErrorKind, message: string, comment?: string) {
    super(message);
    this.name = "CfApiError";
    this.kind = kind;
    this.comment = comment;
  }
}

const API_BASE = "https://codeforces.com/api";
const MIN_REQUEST_GAP_MS = 2000;

// Module-level politeness throttle: chain every request so consecutive calls
// (e.g. polling two handles in a duel) are always spaced out, without callers
// having to coordinate timing themselves.
let requestQueue: Promise<void> = Promise.resolve();
let lastDispatchAt = 0;

function throttledSlot(): Promise<void> {
  const slot = requestQueue.then(async () => {
    const wait = Math.max(0, lastDispatchAt + MIN_REQUEST_GAP_MS - Date.now());
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastDispatchAt = Date.now();
  });
  requestQueue = slot;
  return slot;
}

function classifyFailure(comment: string | undefined): CfErrorKind {
  const c = (comment || "").toLowerCase();
  if (c.includes("not found")) return "NOT_FOUND";
  if (c.includes("limit")) return "RATE_LIMITED";
  return "API_FAILED";
}

async function cfGet<T>(method: string, params: Record<string, string>): Promise<T> {
  await throttledSlot();

  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/${method}${query ? `?${query}` : ""}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new CfApiError("NETWORK", "Could not reach Codeforces.");
  }

  let body: { status: string; result?: T; comment?: string };
  try {
    body = await res.json();
  } catch {
    throw new CfApiError("NETWORK", "Codeforces returned an unreadable response.");
  }

  if (body.status !== "OK") {
    const kind = classifyFailure(body.comment);
    throw new CfApiError(kind, body.comment || "Codeforces API request failed.", body.comment);
  }

  return body.result as T;
}

export function isValidHandleFormat(handle: string): boolean {
  return /^[A-Za-z0-9_.-]{2,24}$/.test(handle.trim());
}

export async function fetchUserInfo(handles: string[]): Promise<CfUser[]> {
  return cfGet<CfUser[]>("user.info", { handles: handles.join(";") });
}

export async function fetchProblemset(): Promise<CfProblem[]> {
  const result = await cfGet<{ problems: CfProblem[] }>("problemset.problems", {});
  return result.problems;
}

export async function fetchUserStatus(handle: string, count?: number): Promise<CfSubmission[]> {
  const params: Record<string, string> = { handle, from: "1" };
  if (count) params.count = String(count);
  return cfGet<CfSubmission[]>("user.status", params);
}

export function problemKey(p: { contestId: number; index: string }): string {
  return `${p.contestId}-${p.index}`;
}

export function problemUrl(p: { contestId: number; index: string }): string {
  return `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
}

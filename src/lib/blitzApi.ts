// Client for our backend's session-authoritative Blitz & Duel endpoints
// (server/src/routes/blitz.ts). The server draws the problem set, tracks
// solves, and keeps polling Codeforces even while no browser tab is open —
// the frontend just creates a session, reads it back, and renders it.

import type { BlitzMode, BlitzSession } from "./blitzSession";
import { API_ORIGIN } from "./apiBase";

export type BlitzApiErrorKind = "NOT_FOUND" | "RATE_LIMITED" | "BAD_REQUEST" | "NO_PROBLEMS" | "API_FAILED" | "NETWORK";

export class BlitzApiError extends Error {
  kind: BlitzApiErrorKind;

  constructor(kind: BlitzApiErrorKind, message: string) {
    super(message);
    this.name = "BlitzApiError";
    this.kind = kind;
  }
}

const API_BASE = `${API_ORIGIN}/api/blitz`;

/** localStorage key holding the currently-active session's id (not the session
 *  itself — that lives server-side now). Shared between BlitzDuelView (owns
 *  it) and useCfHandle (clears it on unlink, since a session tied to a handle
 *  you've since unlinked shouldn't keep showing up). */
export const SESSION_ID_KEY = "bb_blitz_session_id";

function classify(status: number, errorCode?: string): BlitzApiErrorKind {
  if (errorCode === "NO_PROBLEMS") return "NO_PROBLEMS";
  if (status === 404) return "NOT_FOUND";
  if (status === 429) return "RATE_LIMITED";
  if (status === 400) return "BAD_REQUEST";
  return "API_FAILED";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, init);
  } catch {
    throw new BlitzApiError("NETWORK", "Could not reach the Binary Beats API.");
  }

  let body: { error?: string; message?: string } & Partial<T> = {};
  try {
    body = await res.json();
  } catch {
    // e.g. a 204 No Content response has no body
  }

  if (!res.ok) {
    throw new BlitzApiError(classify(res.status, body.error), body.message || "Request failed.");
  }

  return body as T;
}

export async function createSession(mode: BlitzMode, handle: string, rivalHandle?: string): Promise<BlitzSession> {
  const { session } = await request<{ session: BlitzSession }>("/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, handle, rivalHandle }),
  });
  return session;
}

export async function getSession(id: string): Promise<BlitzSession> {
  const { session } = await request<{ session: BlitzSession }>(`/sessions/${id}`);
  return session;
}

export async function endSession(id: string): Promise<void> {
  await request<void>(`/sessions/${id}/end`, { method: "POST" });
}

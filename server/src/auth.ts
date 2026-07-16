/**
 * Auth helpers — password hashing and the signed session cookie.
 * Session state itself is just a JWT (id + email) stored in an httpOnly
 * cookie; there's no separate session table to keep in sync.
 */
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Context } from "koa";

const SESSION_COOKIE = "bb_session";
const SESSION_TTL_S = 30 * 24 * 60 * 60; // 30 days

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error(
    "[auth] SESSION_SECRET is not set. Add a long random value to server/.env " +
    "(e.g. `openssl rand -hex 32`)."
  );
}

export interface SessionPayload {
  sub: string; // user id
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, SESSION_SECRET!, { expiresIn: SESSION_TTL_S });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SESSION_SECRET!) as SessionPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(ctx: Context, token: string): void {
  // "lax" works for same-origin (local dev via the Vite proxy, or a same-domain
  // deploy). Once the request arrives over HTTPS we assume frontend and backend
  // may be on different domains (e.g. Vercel + Render) and need "none" for the
  // browser to send the cookie on cross-site fetches — which itself requires
  // `secure: true`, hence the two being tied together here.
  const crossSite = ctx.secure;
  ctx.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: crossSite ? "none" : "lax",
    secure: crossSite,
    maxAge: SESSION_TTL_S * 1000,
    path: "/",
  });
}

export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.set(SESSION_COOKIE, null, { path: "/" });
}

export function getSessionFromRequest(ctx: Context): SessionPayload | null {
  const token = ctx.cookies.get(SESSION_COOKIE);
  if (!token) return null;
  return verifySession(token);
}

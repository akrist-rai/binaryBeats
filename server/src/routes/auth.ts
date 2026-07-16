import { randomUUID } from "node:crypto";
import Router from "@koa/router";
import type { Context } from "koa";
import { eq } from "drizzle-orm";
import { OAuth2Client } from "google-auth-library";
import { authDb as db } from "../db/authDb.js";
import { users } from "../db/schema.js";
import {
  hashPassword,
  verifyPassword,
  signSession,
  setSessionCookie,
  clearSessionCookie,
  getSessionFromRequest,
} from "../auth.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || null;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type UserRow = typeof users.$inferSelect;

function publicUser(row: UserRow) {
  return { id: row.id, email: row.email, name: row.name, avatarUrl: row.avatarUrl };
}

function badRequest(ctx: Context, message: string) {
  ctx.status = 400;
  ctx.body = { error: "BAD_REQUEST", message };
}

// `db` is null when AUTH_DATABASE_URL isn't set — every route that touches it
// checks this first and 503s instead of throwing, so the rest of the API
// keeps working while auth is still being set up.
function authDbUnavailable(ctx: Context): boolean {
  if (db) return false;
  ctx.status = 503;
  ctx.body = {
    error: "AUTH_NOT_CONFIGURED",
    message: "Auth isn't set up yet — set AUTH_DATABASE_URL in server/.env.",
  };
  return true;
}

async function findByEmail(email: string): Promise<UserRow | undefined> {
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0];
}

async function findById(id: string): Promise<UserRow | undefined> {
  if (!db) return undefined;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}

const router = new Router({ prefix: "/api/auth" });

// GET /api/auth/config — tells the frontend whether Google Sign-In is set up,
// and with which client ID, without hardcoding it into static HTML.
router.get("/config", async (ctx) => {
  ctx.body = { googleClientId: GOOGLE_CLIENT_ID };
});

// POST /api/auth/register { email, password, name }
router.post("/register", async (ctx) => {
  if (!db) return void authDbUnavailable(ctx);

  const body = (ctx.request.body ?? {}) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!EMAIL_RE.test(email)) return badRequest(ctx, "Enter a valid email address.");
  if (password.length < 8) return badRequest(ctx, "Access code must be at least 8 characters.");
  if (!name) return badRequest(ctx, "Enter a display name.");

  const existing = await findByEmail(email);
  if (existing) {
    ctx.status = 409;
    ctx.body = { error: "EMAIL_TAKEN", message: "An account with that email already exists." };
    return;
  }

  const row: UserRow = {
    id: randomUUID(),
    email,
    name,
    passwordHash: await hashPassword(password),
    googleId: null,
    avatarUrl: null,
    createdAt: new Date(),
  };
  await db.insert(users).values(row);

  setSessionCookie(ctx, signSession({ sub: row.id, email: row.email }));
  ctx.body = { user: publicUser(row) };
});

// POST /api/auth/login { email, password }
router.post("/login", async (ctx) => {
  if (authDbUnavailable(ctx)) return;

  const body = (ctx.request.body ?? {}) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const invalid = () => {
    ctx.status = 401;
    ctx.body = { error: "INVALID_CREDENTIALS", message: "Incorrect email or access code." };
  };

  if (!email || !password) return invalid();

  const row = await findByEmail(email);
  if (!row) return invalid();

  if (!row.passwordHash) {
    ctx.status = 401;
    ctx.body = {
      error: "GOOGLE_ONLY_ACCOUNT",
      message: "This account was created with Google — use the Google button instead.",
    };
    return;
  }

  const ok = await verifyPassword(password, row.passwordHash);
  if (!ok) return invalid();

  setSessionCookie(ctx, signSession({ sub: row.id, email: row.email }));
  ctx.body = { user: publicUser(row) };
});

// POST /api/auth/google { credential } — credential is the Google ID token
// produced client-side by Google Identity Services.
router.post("/google", async (ctx) => {
  if (!googleClient || !GOOGLE_CLIENT_ID) {
    ctx.status = 503;
    ctx.body = {
      error: "GOOGLE_NOT_CONFIGURED",
      message: "Google sign-in isn't configured on this server yet.",
    };
    return;
  }
  if (!db) return void authDbUnavailable(ctx);

  const body = (ctx.request.body ?? {}) as Record<string, unknown>;
  const credential = typeof body.credential === "string" ? body.credential : "";
  if (!credential) return badRequest(ctx, "Missing Google credential.");

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    ctx.status = 401;
    ctx.body = { error: "INVALID_GOOGLE_CREDENTIAL", message: "Could not verify Google credential." };
    return;
  }

  if (!payload?.sub || !payload.email) {
    ctx.status = 401;
    ctx.body = { error: "INVALID_GOOGLE_CREDENTIAL", message: "Google credential missing required fields." };
    return;
  }

  const googleId = payload.sub;
  const email = payload.email.toLowerCase();
  const name = payload.name || email;
  const avatarUrl = payload.picture || null;

  const rows = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  let row = rows[0];

  if (!row) {
    const existingByEmail = await findByEmail(email);
    if (existingByEmail) {
      // Same email already has a password account — link Google to it.
      await db.update(users).set({ googleId, avatarUrl: existingByEmail.avatarUrl ?? avatarUrl }).where(eq(users.id, existingByEmail.id));
      row = { ...existingByEmail, googleId, avatarUrl: existingByEmail.avatarUrl ?? avatarUrl };
    } else {
      row = {
        id: randomUUID(),
        email,
        name,
        passwordHash: null,
        googleId,
        avatarUrl,
        createdAt: new Date(),
      };
      await db.insert(users).values(row);
    }
  }

  setSessionCookie(ctx, signSession({ sub: row.id, email: row.email }));
  ctx.body = { user: publicUser(row) };
});

// POST /api/auth/logout
router.post("/logout", async (ctx) => {
  clearSessionCookie(ctx);
  ctx.status = 204;
});

// GET /api/auth/me
router.get("/me", async (ctx) => {
  if (authDbUnavailable(ctx)) return;

  const session = getSessionFromRequest(ctx);
  if (!session) {
    ctx.status = 401;
    ctx.body = { error: "UNAUTHENTICATED", message: "Not signed in." };
    return;
  }

  const row = await findById(session.sub);
  if (!row) {
    clearSessionCookie(ctx);
    ctx.status = 401;
    ctx.body = { error: "UNAUTHENTICATED", message: "Not signed in." };
    return;
  }

  ctx.body = { user: publicUser(row) };
});

export default router;

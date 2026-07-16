import "dotenv/config";
import Koa from "koa";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import authRouter from "./routes/auth.js";
import cfRouter from "./routes/cf.js";
import blitzRouter from "./routes/blitz.js";
import problemsRouter from "./routes/problems.js";
import judgeRouter from "./routes/judge.js";
import { startSessionPoller } from "./sessionPoller.js";
import { sweepStaleJudgeDirs } from "./judge/executor.js";

const app = new Koa();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// Trust X-Forwarded-Proto/-For from the platform's reverse proxy (Render,
// Railway, Fly, ...) so ctx.secure reflects the original HTTPS request
// instead of the plain-HTTP hop to this process — the session cookie's
// `secure`/`sameSite` flags below depend on it.
app.proxy = true;

// `credentials: true` + reflecting the request origin (instead of "*") is required
// so the browser will accept and send the httpOnly session cookie cross-origin
// (e.g. Vite dev server on :5173 talking to this API on :4000 without the proxy).
app.use(cors({ credentials: true, origin: (ctx) => ctx.request.header.origin || "*" }));
app.use(bodyParser({ jsonLimit: "10mb" }));

// Health check for deploy platforms (Render, Railway, Fly, ...) and uptime pings.
app.use(async (ctx, next) => {
  if (ctx.path === "/api/health") {
    ctx.body = { ok: true };
    return;
  }
  await next();
});

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "INTERNAL", message: "Unexpected server error." };
    console.error(err);
  }
});

app.use(authRouter.routes());
app.use(authRouter.allowedMethods());
app.use(cfRouter.routes());
app.use(cfRouter.allowedMethods());
app.use(blitzRouter.routes());
app.use(blitzRouter.allowedMethods());
app.use(problemsRouter.routes());
app.use(problemsRouter.allowedMethods());
app.use(judgeRouter.routes());
app.use(judgeRouter.allowedMethods());

startSessionPoller();
sweepStaleJudgeDirs();

app.listen(PORT, () => {
  console.log(`Binary Beats API listening on http://localhost:${PORT}`);
});

import "dotenv/config";
import Koa from "koa";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import cfRouter from "./routes/cf.js";
import blitzRouter from "./routes/blitz.js";
import problemsRouter from "./routes/problems.js";
import judgeRouter from "./routes/judge.js";
import { startSessionPoller } from "./sessionPoller.js";
import { sweepStaleJudgeDirs } from "./judge/executor.js";

const app = new Koa();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(bodyParser({ jsonLimit: "10mb" }));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = 500;
    ctx.body = { error: "INTERNAL", message: "Unexpected server error." };
    console.error(err);
  }
});

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

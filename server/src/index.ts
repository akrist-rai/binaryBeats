import Koa from "koa";
import cors from "@koa/cors";
import { bodyParser } from "@koa/bodyparser";
import cfRouter from "./routes/cf.js";
import blitzRouter from "./routes/blitz.js";
import { startSessionPoller } from "./sessionPoller.js";

const app = new Koa();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(bodyParser());

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

startSessionPoller();

app.listen(PORT, () => {
  console.log(`Binary Beats API listening on http://localhost:${PORT}`);
});

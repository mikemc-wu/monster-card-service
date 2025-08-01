import Koa from "koa";
import helmet from "koa-helmet";
import cors from "@koa/cors";
import router from "./route/index.ts";
import { logger } from "./middleware/winston-logging.ts";
import { timer } from "./middleware/timer.ts";

const app = new Koa();
app.proxy = true;
app.use(helmet())
    .use(cors({ "exposeHeaders": ["X-Response-Time"] }))
    .use(logger())
    .use(timer())
    .use(router.routes())
    .use(router.allowedMethods());
app.on("error", async (err) => {
    console.log(err);
});

export default app;
import { Middleware } from "koa";

export const timer = (): Middleware => {
    return async function timerMiddleware (ctx, next) {
        const start: number = Date.now();
        await next();
        const ms: number = Date.now() - start;
        ctx.set("X-Response-Time", `${ ms }ms`);
    }
}
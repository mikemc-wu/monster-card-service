import { createLogger, format, transports, } from "winston";
import { Middleware } from "koa";
import { serviceName } from "../config.js";

const { combine, timestamp, label, metadata, printf, colorize, prettyPrint, json } = format;
const logFormat = printf(
    ({
         timestamp,
         label,
         message,
         level,
     }) => `${ timestamp } ${ level } [${ label }]: ${ message }`
);
export const loggerInstance = createLogger(
    {
        "level": "info",
        "format":  combine(
            label({ "label": serviceName }),
            timestamp(),
            metadata({ "fillExcept": ["message", "label", "level"] }),
            json()
        ),
        "defaultMeta": {
            "service": serviceName
        },
        "transports": [
            new transports.File({ "filename": "combined.log" }),
            new transports.Console({ "format": combine(colorize(), timestamp(), logFormat,) }),
        ],
    }
);

export const logger = (): Middleware => {
    return async function loggerMiddleware (ctx, next) {
        await next();

        const { ip, method, url, status, } = ctx;
        const processTime: string = ctx.response.get("X-Response-Time");
        const userAgent: string = ctx.request.header["user-agent"] || "";

        loggerInstance.log(
            "info",
            `${ ip } ${ method } ${ url } ${ status } ${ userAgent } ${ processTime }`,
            { ip, method, url, status, processTime, userAgent }
        );
    }
}
import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info",
    format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.json()),
    transports: [
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/combined.log" }),
        new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
        }),
    ],
});

export const winstonMiddleware = (req: any, res: any, next: any) => {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const { statusCode } = res;

        logger.info({
            method,
            url: originalUrl,
            status: statusCode,
            duration: `${duration}ms`,
        });
    });

    next();
};

export default logger;

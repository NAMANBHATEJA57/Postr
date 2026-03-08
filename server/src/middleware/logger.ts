import { Request, Response, NextFunction } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";

    res.on("finish", () => {
        const duration = Date.now() - start;
        const isAbuse = res.statusCode === 429 || res.statusCode === 403;

        if (isAbuse) {
            console.warn(
                `[ABUSE_DETECTED] IP: ${ip} | Method: ${req.method} | URL: ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`
            );
        } else {
            console.log(
                `[ACCESS] IP: ${ip} | Method: ${req.method} | URL: ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms`
            );
        }
    });

    next();
};

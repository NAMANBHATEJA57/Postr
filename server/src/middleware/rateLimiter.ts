import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { Request, Response, NextFunction } from "express";

let redis: Redis | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    } else {
        console.warn("Upstash Redis credentials missing. Rate limiting is disabled.");
    }
} catch (error) {
    console.error("Failed to initialize Redis:", error);
}

const createMiddleware = (limiter: Ratelimit | null) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (!limiter) {
            return next(); // Pass if rate limiting is disabled
        }

        try {
            const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";
            const identifier = Array.isArray(ip) ? ip[0] : ip;

            const { success } = await limiter.limit(identifier);

            if (!success) {
                return res.status(429).json({ error: "Too many requests. Please try again in a moment." });
            }

            next();
        } catch (error) {
            console.error("Rate limiting error:", error);
            // Fallback to allowing the request if Redis is temporarily unreachable
            next();
        }
    };
};

// 10 requests per minute
export const createPostcardLimiter = createMiddleware(
    redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }) : null
);

// 5 requests per minute
export const sendPostcardLimiter = createMiddleware(
    redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null
);

// 5 requests per minute
export const uploadLimiter = createMiddleware(
    redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null
);

// 60 requests per minute
export const fetchPostcardLimiter = createMiddleware(
    redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m") }) : null
);

// 5 requests per minute
export const authLimiter = createMiddleware(
    redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null
);

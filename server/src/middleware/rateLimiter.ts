import "../lib/env.js";
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
        console.warn("Upstash Redis credentials missing. Falling back to in-memory rate limiting.");
    }
} catch (error) {
    console.error("Failed to initialize Redis:", error);
}

// ── In-Memory Sliding Window Fallback Store ──
interface RateLimitWindow {
    timestamps: number[];
}

const memoryStore = new Map<string, RateLimitWindow>();

function checkInMemoryLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    let entry = memoryStore.get(key);
    if (!entry) {
        entry = { timestamps: [] };
        memoryStore.set(key, entry);
    }

    // Filter timestamps to only retain those inside the active window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    if (entry.timestamps.length >= limit) {
        return false;
    }

    entry.timestamps.push(now);
    return true;
}

// Memory cleanup routine every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of memoryStore.entries()) {
            entry.timestamps = entry.timestamps.filter((ts) => now - ts < 3600000); // 1 hour max retention
            if (entry.timestamps.length === 0) {
                memoryStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

interface LimiterConfig {
    redisLimiter: Ratelimit | null;
    fallbackLimit: number;
    fallbackWindowMs: number;
    name: string;
}

const createMiddleware = (config: LimiterConfig) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.headers["x-forwarded-for"] || "anonymous";
        const identifier = Array.isArray(ip) ? ip[0] : ip;
        const key = `${config.name}:${identifier}`;

        // 1. Attempt Redis Rate Limiting
        if (config.redisLimiter) {
            try {
                const { success } = await config.redisLimiter.limit(identifier);
                if (success) {
                    return next();
                } else {
                    return res.status(429).json({ error: "Too many requests. Please try again in a moment." });
                }
            } catch (error) {
                console.error(`Redis rate limiter error for ${config.name}, falling back to memory:`, error);
            }
        }

        // 2. Fallback to In-Memory Sliding Window
        const allowed = checkInMemoryLimit(key, config.fallbackLimit, config.fallbackWindowMs);
        if (!allowed) {
            return res.status(429).json({ error: "Too many requests. Please try again in a moment." });
        }

        next();
    };
};

// 10 requests per minute
export const createPostcardLimiter = createMiddleware({
    redisLimiter: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }) : null,
    fallbackLimit: 10,
    fallbackWindowMs: 60 * 1000,
    name: "create-postcard"
});

// 5 requests per minute
export const sendPostcardLimiter = createMiddleware({
    redisLimiter: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null,
    fallbackLimit: 5,
    fallbackWindowMs: 60 * 1000,
    name: "send-postcard"
});

// 5 requests per minute
export const uploadLimiter = createMiddleware({
    redisLimiter: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null,
    fallbackLimit: 5,
    fallbackWindowMs: 60 * 1000,
    name: "upload-file"
});

// 60 requests per minute
export const fetchPostcardLimiter = createMiddleware({
    redisLimiter: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m") }) : null,
    fallbackLimit: 60,
    fallbackWindowMs: 60 * 1000,
    name: "fetch-postcard"
});

// 5 requests per minute
export const authLimiter = createMiddleware({
    redisLimiter: redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }) : null,
    fallbackLimit: 5,
    fallbackWindowMs: 60 * 1000,
    name: "auth-check"
});

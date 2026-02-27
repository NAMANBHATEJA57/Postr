interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function checkLimit(
    key: string,
    maxRequests: number,
    windowMs: number
): { allowed: boolean; retryAfter?: number } {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs });
        return { allowed: true };
    }

    if (entry.count >= maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        return { allowed: false, retryAfter };
    }

    entry.count++;
    return { allowed: true };
}

// 10 create requests per hour per IP
export function checkCreateLimit(ip: string) {
    return checkLimit(`create:${ip}`, 10, 60 * 60 * 1000);
}

// 5 password attempts per 10 minutes per IP+postcardId
export function checkPasswordLimit(ip: string, postcardId: string) {
    return checkLimit(`pw:${ip}:${postcardId}`, 5, 10 * 60 * 1000);
}

// Cleanup stale entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        Array.from(store.entries()).forEach(([key, entry]) => {
            if (now > entry.resetAt) store.delete(key);
        });
    }, 5 * 60 * 1000);
}

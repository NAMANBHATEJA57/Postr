import { Request, Response, NextFunction } from "express";

export const verifyTurnstileToken = async (req: Request, res: Response, next: NextFunction) => {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        // Safe fallback for local testing when keys are not configured in environment
        return next();
    }

    const token = req.body.turnstileToken;
    if (!token) {
        return res.status(400).json({ error: "Security verification token is required." });
    }

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                secret: secretKey,
                response: token,
                remoteip: req.ip || req.headers["x-forwarded-for"],
            }),
        });

        const data = (await response.json()) as { success: boolean; "error-codes"?: string[] };
        
        if (!data.success) {
            console.warn("Cloudflare Turnstile verification failed:", data["error-codes"]);
            return res.status(400).json({ error: "Security verification failed. Please try again." });
        }

        next();
    } catch (error) {
        console.error("Cloudflare Turnstile API communication error:", error);
        // Fail-open strategy to prevent app downtime if Turnstile servers are temporarily unreachable
        next();
    }
};

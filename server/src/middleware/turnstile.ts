import { Request, Response, NextFunction } from "express";

export const verifyTurnstileToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers["cf-turnstile-response"] || req.body["cf-turnstile-response"];

    if (!token) {
        return res.status(400).json({ error: "Missing bot protection token." });
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
        console.warn("Turnstile secret key is not configured. Skipping verification.");
        return next();
    }

    try {
        const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token as string)}`,
        });

        const data = await response.json() as any;

        if (!data.success) {
            console.error("Turnstile validation failed:", data);
            return res.status(403).json({ error: "Bot verification failed. Please refresh and try again." });
        }

        next();
    } catch (error) {
        console.error("Error verifying Turnstile token:", error);
        return res.status(500).json({ error: "Internal server error during verification." });
    }
};

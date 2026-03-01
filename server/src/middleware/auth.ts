import { Router, type Request, type Response, type NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";
import { prisma } from "../lib/prisma.js";

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
            };
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
        return res.status(401).json({ error: "Invalid token" });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token;

    if (!token) {
        return next();
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.userId) {
        return next();
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
            select: { id: true, name: true, email: true },
        });

        if (user) {
            req.user = user;
        }
    } catch (err) {
        console.error("Optional auth middleware error:", err);
    }
    next();
}

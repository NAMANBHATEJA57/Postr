import { type Request, type Response, type NextFunction } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
    return res.status(401).json({ error: "Authentication removed" });
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
    next();
}

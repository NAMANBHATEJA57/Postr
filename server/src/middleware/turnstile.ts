import { Request, Response, NextFunction } from "express";

export const verifyTurnstileToken = async (req: Request, res: Response, next: NextFunction) => {
    // Disabled bot protection temporarily so creation can be tested without turnstile UI.
    return next();
};

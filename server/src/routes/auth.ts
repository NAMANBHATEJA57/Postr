import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signToken } from "../lib/auth.js";
import { generateId } from "../lib/nanoid.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Validation Schemas
const registerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    claimPostcardId: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
});

// Configure standard cookie settings
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

router.post("/register", async (req: Request, res: Response) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed", issues: parsed.error.issues });
    }

    const { name, email, password } = parsed.data;
    const lowercaseEmail = email.toLowerCase();

    try {
        // Check if user exists
        const existing = await prisma.user.findUnique({ where: { email: lowercaseEmail } });
        if (existing) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const id = generateId();
        const passwordHash = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                id,
                name,
                email: lowercaseEmail,
                passwordHash,
            },
        });

        if (parsed.data.claimPostcardId) {
            const pc = await prisma.postcard.findUnique({
                where: { id: parsed.data.claimPostcardId }
            });
            if (pc && !pc.senderId) {
                await prisma.postcard.update({
                    where: { id: pc.id },
                    data: { senderId: user.id }
                });
            }
        }

        const token = await signToken({ userId: user.id });
        res.cookie("token", token, cookieOptions);

        return res.status(201).json({
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Failed to register" });
    }
});

router.post("/login", async (req: Request, res: Response) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed" });
    }

    const { email, password } = parsed.data;

    try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = await signToken({ userId: user.id });
        res.cookie("token", token, cookieOptions);

        return res.json({
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Failed to login" });
    }
});

router.post("/logout", (req: Request, res: Response) => {
    res.clearCookie("token", {
        ...cookieOptions,
        maxAge: 0,
    });
    return res.json({ success: true });
});

router.get("/me", requireAuth, (req: Request, res: Response) => {
    return res.json({ user: req.user });
});

export default router;

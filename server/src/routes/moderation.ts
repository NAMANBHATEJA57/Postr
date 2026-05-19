import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

const MODERATION_KEY = process.env.MODERATION_KEY || "dearly-local-moderation-secret-key-change-in-prod";

// Flag / Report a postcard as inappropriate
router.post("/:id/report", authLimiter, async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
    return res.status(400).json({ error: "Invalid postcard ID" });
  }

  try {
    // 1. Check Public Posts
    let post = await prisma.publicPost.findUnique({ where: { id } });
    if (post) {
      await prisma.publicPost.update({
        where: { id },
        data: { reportsCount: { increment: 1 } },
      });
      return res.json({ ok: true, message: "Thank you for reporting. We will review this postcard." });
    }

    // 2. Check Private Posts
    post = await prisma.privatePost.findUnique({ where: { id } });
    if (post) {
      await prisma.privatePost.update({
        where: { id },
        data: { reportsCount: { increment: 1 } },
      });
      return res.json({ ok: true, message: "Thank you for reporting. We will review this postcard." });
    }

    return res.status(404).json({ error: "Postcard not found" });
  } catch (err) {
    console.error("Moderation report error:", err);
    return res.status(500).json({ error: "Failed to record report" });
  }
});

// Moderation / Admin Delete endpoint
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const clientKey = req.headers["x-dearly-moderation-key"];

  if (!clientKey || clientKey !== MODERATION_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
    return res.status(400).json({ error: "Invalid postcard ID" });
  }

  try {
    // 1. Try deleting from Public Posts
    const publicPost = await prisma.publicPost.findUnique({ where: { id } });
    if (publicPost) {
      await prisma.publicPost.delete({ where: { id } });
      return res.json({ ok: true, message: "Postcard deleted successfully" });
    }

    // 2. Try deleting from Private Posts
    const privatePost = await prisma.privatePost.findUnique({ where: { id } });
    if (privatePost) {
      await prisma.privatePost.delete({ where: { id } });
      return res.json({ ok: true, message: "Postcard deleted successfully" });
    }

    return res.status(404).json({ error: "Postcard not found" });
  } catch (err) {
    console.error("Moderation delete error:", err);
    return res.status(500).json({ error: "Failed to delete postcard" });
  }
});

export default router;

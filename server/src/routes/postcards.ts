import { Router, type Request, type Response } from "express";
import { createPostcardSchema } from "../lib/schemas.js";
import { generateId } from "../lib/nanoid.js";
import { hashPassword } from "../lib/password.js";
import { checkCreateLimit } from "../lib/ratelimit.js";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = checkCreateLimit(ip);

  if (!allowed) {
    return res.status(429).json({
      error: "Too many requests. Try again later.",
      ...(retryAfter && { "Retry-After": retryAfter }),
    });
  }

  const parsed = createPostcardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation failed",
      issues: parsed.error.issues,
    });
  }

  const { password, expiryAt, ...data } = parsed.data;

  const id = generateId();
  const passwordHash = password ? await hashPassword(password) : null;

  try {
    await prisma.postcard.create({
      data: {
        id,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        title: data.title,
        message: data.message,
        toName: data.toName,
        fromName: data.fromName,
        theme: data.theme,
        expiryAt: expiryAt ? new Date(expiryAt) : null,
        passwordHash,
      },
    });
  } catch (err) {
    console.error("DB create error:", err);
    return res.status(500).json({ error: "Failed to save postcard" });
  }

  return res.status(201).json({ id });
});

export default router;

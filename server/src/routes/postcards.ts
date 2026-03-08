import { Router, type Request, type Response } from "express";
import { createPostcardSchema } from "../lib/schemas.js";
import { generateId } from "../lib/nanoid.js";
import { hashPassword } from "../lib/password.js";
import { checkCreateLimit } from "../lib/ratelimit.js";
import { prisma } from "../lib/prisma.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { encryptMessage } from "../lib/encryption.js";
import { createPostcardLimiter } from "../middleware/rateLimiter.js";
import { verifyTurnstileToken } from "../middleware/turnstile.js";
import sanitizeHtml from "sanitize-html";

const router = Router();

router.post("/", createPostcardLimiter, verifyTurnstileToken, optionalAuth, async (req: Request, res: Response) => {
  // Legacy rate limiting (IP-based local limit fallback if desired, but we can rely on Upstash now)
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

  const { password, expiryAt, stampId, conversationId, ...data } = parsed.data;
  const userId = req.user?.id;

  if (conversationId) {
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized for this conversation" });
    }
    const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!conv || (conv.userOneId !== userId && conv.userTwoId !== userId)) {
      return res.status(403).json({ error: "Unauthorized for this conversation" });
    }
  }

  let finalExpiryDate: Date | null = null;
  if (!userId) {
    // Guest: ALWAYS expires exactly 7 days from server creation time, ignoring any client input.
    finalExpiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  } else if (expiryAt) {
    // User with explicit expiry
    finalExpiryDate = new Date(expiryAt);
  }
  // User without explicit expiry leaves finalExpiryDate as null (never expires).

  console.log("Saving postcard. Input expiryAt:", expiryAt, "-> finalExpiryDate:", finalExpiryDate);

  const id = generateId();
  const passwordHash = password ? await hashPassword(password) : null;

  // Sanitize text inputs
  const sanitizedTitle = sanitizeHtml(data.title ?? "", {
    allowedTags: [], // Strips all HTML tags
    allowedAttributes: {},
  });
  const sanitizedMessage = sanitizeHtml(data.message ?? "", {
    allowedTags: [], // Since messages are plain text, strip everything
    allowedAttributes: {},
  });

  try {
    await prisma.postcard.create({
      data: {
        id,
        mediaUrl: data.mediaUrl ?? "",
        mediaType: data.mediaType ?? "",
        title: sanitizedTitle,
        message: encryptMessage(sanitizedMessage),
        toName: data.toName ?? "",
        fromName: data.fromName ?? "",
        theme: data.theme,
        expiryAt: finalExpiryDate,
        passwordHash,
        stampId: stampId ?? null,
        conversationId: conversationId ?? null,
        senderId: userId ?? null,
      },
    });
  } catch (err) {
    console.error("DB create error:", err);
    return res.status(500).json({ error: "Failed to save postcard" });
  }

  return res.status(201).json({ id });
});

export default router;

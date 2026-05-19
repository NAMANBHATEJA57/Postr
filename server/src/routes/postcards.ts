import { Router, type Request, type Response } from "express";
import sanitizeHtml from "sanitize-html";
import { prisma } from "../lib/prisma.js";
import { createPostcardSchema } from "../lib/schemas.js";
import { generateId } from "../lib/nanoid.js";
import { hashPassword } from "../lib/password.js";
import { checkCreateLimit } from "../lib/ratelimit.js";
import { encryptMessage, decryptMessage } from "../lib/encryption.js";
import { optionalAuth } from "../middleware/auth.js";
import { createPostcardLimiter, fetchPostcardLimiter } from "../middleware/rateLimiter.js";
import { verifyTurnstileToken } from "../middleware/turnstile.js";

const router = Router();

router.get("/public", fetchPostcardLimiter, async (_req: Request, res: Response) => {
  try {
    const postcards = await prisma.publicPost.findMany({
      where: {
        OR: [{ expiryAt: null }, { expiryAt: { gt: new Date() } }],
      },
      orderBy: { createdAt: "desc" },
      take: 60,
    });

    return res.json({
      postcards: postcards.map((postcard) => ({
        id: postcard.id,
        mediaUrl: postcard.mediaUrl,
        mediaType: postcard.mediaType,
        title: postcard.title,
        message: decryptMessage(postcard.message),
        toName: "",
        fromName: postcard.senderName,
        theme: postcard.theme,
        expiryAt: postcard.expiryAt?.toISOString() ?? null,
        isPasswordProtected: Boolean(postcard.passwordHash),
        stampId: postcard.stampId ?? null,
        createdAt: postcard.createdAt.toISOString(),
        visibility: "public",
        spaceId: null,
      })),
    });
  } catch (err) {
    console.error("Failed to fetch public postcards:", err);
    return res.status(500).json({ error: "Failed to fetch public postcards" });
  }
});

router.get("/space/:spaceId", fetchPostcardLimiter, async (req: Request, res: Response) => {
  const { spaceId } = req.params;

  try {
    const space = await prisma.privateSpace.findUnique({
      where: { id: spaceId.toUpperCase() },
      include: {
        postcards: {
          where: {
            OR: [{ expiryAt: null }, { expiryAt: { gt: new Date() } }],
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!space) {
      return res.status(404).json({ error: "Private space not found" });
    }

    return res.json({
      space: {
        id: space.id,
        createdAt: space.createdAt.toISOString(),
        postcards: space.postcards.map((postcard) => ({
          id: postcard.id,
          mediaUrl: postcard.mediaUrl,
          mediaType: postcard.mediaType,
          title: postcard.title,
          message: decryptMessage(postcard.message),
          toName: postcard.recipientName,
          fromName: postcard.senderName,
          theme: postcard.theme,
          expiryAt: postcard.expiryAt?.toISOString() ?? null,
          isPasswordProtected: Boolean(postcard.passwordHash),
          stampId: postcard.stampId ?? null,
          createdAt: postcard.createdAt.toISOString(),
          visibility: "private",
          spaceId: postcard.spaceId,
        })),
      },
    });
  } catch (err) {
    console.error("Failed to fetch private space postcards:", err);
    return res.status(500).json({ error: "Failed to fetch private space" });
  }
});

router.post("/", createPostcardLimiter, verifyTurnstileToken, optionalAuth, async (req: Request, res: Response) => {
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

  const { password, expiryAt, stampId, visibility, spaceId, ...data } = parsed.data;
  const normalizedSpaceId = spaceId?.trim().toUpperCase() || null;
  const finalVisibility = normalizedSpaceId ? "private" : visibility;

  if (normalizedSpaceId) {
    const space = await prisma.privateSpace.findUnique({ where: { id: normalizedSpaceId } });
    if (!space) {
      return res.status(404).json({ error: "Private space not found" });
    }
  }

  let finalExpiryDate: Date | null = null;
  if (expiryAt) {
    finalExpiryDate = new Date(expiryAt);
  }

  const id = generateId();
  const passwordHash = password ? await hashPassword(password) : null;

  const sanitizedTitle = sanitizeHtml(data.title ?? "", { allowedTags: [], allowedAttributes: {} });
  const sanitizedMessage = sanitizeHtml(data.message ?? "", { allowedTags: [], allowedAttributes: {} });
  const sanitizedToName = sanitizeHtml(data.toName ?? "", { allowedTags: [], allowedAttributes: {} });
  const sanitizedFromName = sanitizeHtml(data.fromName ?? "", { allowedTags: [], allowedAttributes: {} });

  try {
    if (finalVisibility === "private" && normalizedSpaceId) {
      await prisma.privatePost.create({
        data: {
          id,
          spaceId: normalizedSpaceId,
          mediaUrl: data.mediaUrl ?? "",
          mediaType: data.mediaType ?? "",
          title: sanitizedTitle,
          message: encryptMessage(sanitizedMessage),
          recipientName: sanitizedToName,
          senderName: sanitizedFromName,
          theme: data.theme,
          expiryAt: finalExpiryDate,
          passwordHash,
          stampId: stampId ?? null,
        },
      });
    } else {
      await prisma.publicPost.create({
        data: {
          id,
          mediaUrl: data.mediaUrl ?? "",
          mediaType: data.mediaType ?? "",
          title: sanitizedTitle,
          message: encryptMessage(sanitizedMessage),
          senderName: sanitizedFromName,
          theme: data.theme,
          expiryAt: finalExpiryDate,
          passwordHash,
          stampId: stampId ?? null,
        },
      });
    }
  } catch (err) {
    console.error("DB create error:", err);
    return res.status(500).json({ error: "Failed to save postcard" });
  }

  return res.status(201).json({ id, visibility: finalVisibility, spaceId: normalizedSpaceId });
});

export default router;

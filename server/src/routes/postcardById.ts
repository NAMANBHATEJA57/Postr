import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../lib/token.js";

const router = Router();

async function getPostcardHandler(req: Request, res: Response) {
  const { id } = req.params;

  if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
    return res.status(400).json({ error: "Invalid postcard ID" });
  }

  let postcard: Awaited<ReturnType<typeof prisma.postcard.findUnique>>;
  try {
    postcard = await prisma.postcard.findUnique({ where: { id } });
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ error: "Database error" });
  }

  if (!postcard) {
    return res.status(404).json({ error: "Not found" });
  }

  if (postcard.expiryAt && postcard.expiryAt < new Date()) {
    return res.status(410).json({ error: "This postcard has expired" });
  }

  if (postcard.passwordHash) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies?.[`access_${id}`];

    if (!token) {
      return res.status(401).json({
        error: "Password required",
        isPasswordProtected: true,
      });
    }

    const payload = await verifyAccessToken(token);
    if (!payload || payload.postcardId !== id) {
      return res.status(401).json({
        error: "Invalid or expired session",
        isPasswordProtected: true,
      });
    }
  }

  const response = {
    id: postcard.id,
    mediaUrl: postcard.mediaUrl,
    mediaType: postcard.mediaType,
    title: postcard.title,
    message: postcard.message,
    toName: postcard.toName,
    fromName: postcard.fromName,
    theme: postcard.theme,
    expiryAt: postcard.expiryAt?.toISOString() ?? null,
    isPasswordProtected: Boolean(postcard.passwordHash),
    stampId: postcard.stampId ?? null,
    createdAt: postcard.createdAt.toISOString(),
    conversationId: postcard.conversationId ?? null,
  };

  return res.json(response);
}

router.get("/:id", getPostcardHandler);

export default router;

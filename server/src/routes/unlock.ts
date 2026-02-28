import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyPassword } from "../lib/password.js";
import { signAccessToken } from "../lib/token.js";
import { checkPasswordLimit } from "../lib/ratelimit.js";
import { unlockPostcardSchema } from "../lib/schemas.js";

const router = Router();

router.post("/:id/unlock", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
    return res.status(400).json({ error: "Invalid postcard ID" });
  }

  const ip = req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ?? "unknown";
  const { allowed, retryAfter } = checkPasswordLimit(ip, id);

  if (!allowed) {
    return res.status(429).json({
      error: "Too many password attempts. Wait a few minutes.",
      ...(retryAfter && { "Retry-After": retryAfter }),
    });
  }

  const parsed = unlockPostcardSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Password is required" });
  }

  let postcard: Awaited<ReturnType<typeof prisma.postcard.findUnique>>;
  try {
    postcard = await prisma.postcard.findUnique({ where: { id } });
  } catch {
    return res.status(500).json({ error: "Database error" });
  }

  if (!postcard) {
    return res.status(404).json({ error: "Not found" });
  }

  if (postcard.expiryAt && postcard.expiryAt < new Date()) {
    return res.status(410).json({ error: "Expired" });
  }

  if (!postcard.passwordHash) {
    return res.status(400).json({ error: "Not password protected" });
  }

  const valid = await verifyPassword(parsed.data.password, postcard.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const token = await signAccessToken(id);

  const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
  const isSameOrigin = req.headers.origin === clientOrigin;

  if (isSameOrigin) {
    res.cookie(`access_${id}`, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600,
      path: "/",
    });
  }

  return res.status(200).json({
    ok: true,
    accessToken: token,
  });
});

export default router;

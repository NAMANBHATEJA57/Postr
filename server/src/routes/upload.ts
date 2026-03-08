import { Router, type Request, type Response } from "express";
import { uploadMetaSchema } from "../lib/schemas.js";
import { generateId } from "../lib/nanoid.js";
import {
  validateFileSize,
  generateUploadSignature,
} from "../lib/cloudinary.js";
import { uploadLimiter } from "../middleware/rateLimiter.js";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
};

const router = Router();

router.post("/", uploadLimiter, async (req: Request, res: Response) => {
  const parsed = uploadMetaSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid upload metadata",
      issues: parsed.error.issues,
    });
  }

  const { fileType, fileSize } = parsed.data;

  const ext = ALLOWED_TYPES[fileType];
  if (!ext) {
    return res.status(400).json({
      error: "Unsupported file type. Allowed: JPG, PNG, WebP, GIF, MP4.",
    });
  }

  const sizeCheck = validateFileSize(fileType, fileSize);
  if (!sizeCheck.valid) {
    return res.status(400).json({ error: sizeCheck.error });
  }

  const id = generateId();

  try {
    const signatureData = await generateUploadSignature(id, fileType);
    return res.json(signatureData);
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    return res.status(503).json({ error: "Storage unavailable" });
  }
});

export default router;

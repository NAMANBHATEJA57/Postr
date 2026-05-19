import { Router, type Request, type Response } from "express";
import { prisma } from "../lib/prisma.js";
import { generateSpaceCode } from "../lib/nanoid.js";
import { joinPrivateSpaceSchema } from "../lib/schemas.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = Router();

async function createUniqueCode() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateSpaceCode();
    const existing = await prisma.privateSpace.findUnique({ where: { id: code } });
    if (!existing) {
      return code;
    }
  }

  throw new Error("Could not generate a unique private space code");
}

router.post("/", authLimiter, async (_req: Request, res: Response) => {
  try {
    const code = await createUniqueCode();
    const space = await prisma.privateSpace.create({
      data: {
        id: code,
      },
    });

    return res.status(201).json({
      space: {
        id: space.id,
        createdAt: space.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Failed to create private space:", err);
    return res.status(500).json({ error: "Failed to create private space" });
  }
});

router.post("/join", authLimiter, async (req: Request, res: Response) => {
  const parsed = joinPrivateSpaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid private space code" });
  }

  const code = parsed.data.code.trim().toUpperCase();

  try {
    const existing = await prisma.privateSpace.findUnique({ where: { id: code } });
    if (!existing) {
      return res.status(404).json({ error: "Private space not found" });
    }
    return res.json({ space: { id: existing.id }, joined: true });
  } catch (err) {
    console.error("Failed to join private space:", err);
    return res.status(500).json({ error: "Failed to join private space" });
  }
});

export default router;

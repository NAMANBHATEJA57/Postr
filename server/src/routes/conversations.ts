import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { generateId } from "../lib/nanoid.js";

const router = Router();
router.use(requireAuth);

// Get all conversations for logged in user
router.get("/", async (req: Request, res: Response) => {
    const userId = req.user!.id;

    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR: [{ userOneId: userId }, { userTwoId: userId }],
            },
            include: {
                userOne: { select: { id: true, name: true, email: true } },
                userTwo: { select: { id: true, name: true, email: true } },
                postcards: {
                    orderBy: { createdAt: "desc" },
                    take: 1, // Get only the latest postcard for preview
                },
            },
            orderBy: {
                // Technically Prisma doesn't easily order by relation aggregate max date in findMany simply.
                // We will just fetch and sort in memory since this isn't high scale chat.
                createdAt: "desc"
            }
        });

        const formatted = conversations.map(c => {
            const otherUser = c.userOneId === userId ? c.userTwo : c.userOne;
            const latestPostcard = c.postcards[0] || null;

            return {
                id: c.id,
                otherUser,
                latestPostcard,
                createdAt: c.createdAt,
            };
        });

        // Sort formatted by latest postcard date if exists, else conversation creation
        formatted.sort((a, b) => {
            const dateA = a.latestPostcard ? a.latestPostcard.createdAt.getTime() : a.createdAt.getTime();
            const dateB = b.latestPostcard ? b.latestPostcard.createdAt.getTime() : b.createdAt.getTime();
            return dateB - dateA;
        });

        return res.json({ conversations: formatted });
    } catch (err) {
        console.error("Error fetching conversations:", err);
        return res.status(500).json({ error: "Failed to fetch conversations" });
    }
});

// Start new conversation by user email
const startSchema = z.object({
    email: z.string().email("Invalid email"),
});

router.post("/", async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Validation failed" });
    }

    const targetEmail = parsed.data.email.toLowerCase();

    try {
        const targetUser = await prisma.user.findUnique({ where: { email: targetEmail } });

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        if (targetUser.id === userId) {
            return res.status(400).json({ error: "You cannot start a conversation with yourself" });
        }

        // Determine ordering for unique constraint
        const [userOneId, userTwoId] = [userId, targetUser.id].sort();

        // Check if exists
        let conversation = await prisma.conversation.findUnique({
            where: {
                userOneId_userTwoId: {
                    userOneId,
                    userTwoId,
                }
            }
        });

        // Create if not exists
        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    id: generateId(),
                    userOneId,
                    userTwoId,
                }
            });
        }

        return res.json({ conversation });
    } catch (err) {
        console.error("Error creating conversation:", err);
        return res.status(500).json({ error: "Failed to start conversation" });
    }
});

// Get single conversation details & postcards
router.get("/:id", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    try {
        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                userOne: { select: { id: true, name: true, email: true } },
                userTwo: { select: { id: true, name: true, email: true } },
                postcards: {
                    orderBy: { createdAt: "desc" },
                    include: {
                        sender: { select: { id: true, name: true } }
                    }
                },
            }
        });

        if (!conversation) {
            return res.status(404).json({ error: "Conversation not found" });
        }

        // Check auth
        if (conversation.userOneId !== userId && conversation.userTwoId !== userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const otherUser = conversation.userOneId === userId ? conversation.userTwo : conversation.userOne;

        return res.json({
            conversation: {
                id: conversation.id,
                otherUser,
                postcards: conversation.postcards,
                createdAt: conversation.createdAt,
            }
        });
    } catch (err) {
        console.error("Error fetching conversation details:", err);
        return res.status(500).json({ error: "Failed to fetch conversation" });
    }
});

export default router;

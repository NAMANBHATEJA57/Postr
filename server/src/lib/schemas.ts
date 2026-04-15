import { z } from "zod";

export const createPostcardSchema = z.object({
  mediaUrl: z.string().optional().or(z.literal("")),
  mediaType: z.enum(["image", "video", ""]).optional(),
  title: z.string().max(100, "Title is too long").optional().or(z.literal("")),
  message: z.string().max(500, "Message is too long").optional().or(z.literal("")),
  toName: z.string().optional(),
  fromName: z.string().optional(),
  theme: z.string().default("minimal-light"),
  expiryAt: z.string().optional(),
  password: z.string().optional(),
  stampId: z.string().optional(),
  conversationId: z.string().optional(),
});

export const unlockPostcardSchema = z.object({
  password: z.string().min(1, "Password is required").max(100),
});

export const uploadMetaSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
  ]),
  fileSize: z.number().positive(),
});

export type CreatePostcardInput = z.infer<typeof createPostcardSchema>;
export type UnlockPostcardInput = z.infer<typeof unlockPostcardSchema>;
export type UploadMetaInput = z.infer<typeof uploadMetaSchema>;

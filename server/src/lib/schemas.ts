import { z } from "zod";

export const createPostcardSchema = z.object({
  mediaUrl: z.string().url("Invalid media URL"),
  mediaType: z.enum(["image", "video"]),
  title: z.string().min(1, "Title is required").max(40, "Title max 40 characters"),
  message: z.string().min(1, "Message is required").max(120, "Message max 120 characters"),
  toName: z.string().min(1, "To name is required").max(60, "To name max 60 characters"),
  fromName: z.string().min(1, "From name is required").max(60, "From name max 60 characters"),
  theme: z.enum(["minimal-light", "framed", "full-bleed"]).default("minimal-light"),
  expiryAt: z.string().datetime().nullable().optional(),
  password: z.string().min(4).max(100).optional(),
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
    "video/mp4",
  ]),
  fileSize: z.number().positive(),
});

export type CreatePostcardInput = z.infer<typeof createPostcardSchema>;
export type UnlockPostcardInput = z.infer<typeof unlockPostcardSchema>;
export type UploadMetaInput = z.infer<typeof uploadMetaSchema>;

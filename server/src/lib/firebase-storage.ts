import { getStorageBucket } from "./firebase-admin.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

export function validateFileSize(
  fileType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileType.startsWith("video/")) {
    if (fileSize > MAX_VIDEO_SIZE) {
      return { valid: false, error: "Video must be under 25MB" };
    }
  } else {
    if (fileSize > MAX_IMAGE_SIZE) {
      return { valid: false, error: "Image must be under 5MB" };
    }
  }
  return { valid: true };
}

export async function generateSignedUploadUrl(
  path: string,
  contentType: string
): Promise<string> {
  const bucket = getStorageBucket();
  const file = bucket.file(path);

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
    contentType,
  });

  return url;
}

export function buildPublicDownloadUrl(storagePath: string): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET!;
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encoded}?alt=media`;
}

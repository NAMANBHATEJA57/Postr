import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_GIF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25 MB

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error(
      "Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME"
    );
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export function validateFileSize(
  fileType: string,
  fileSize: number
): { valid: boolean; error?: string } {
  if (fileType.startsWith("video/")) {
    if (fileSize > MAX_VIDEO_SIZE) {
      return { valid: false, error: "Video must be under 25MB" };
    }
  } else if (fileType === "image/gif") {
    if (fileSize > MAX_GIF_SIZE) {
      return { valid: false, error: "GIF must be under 10MB" };
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
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;

  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      ContentType: contentType,
    }),
    { expiresIn: 5 * 60 } // 5 minutes
  );

  return url;
}

export function buildPublicDownloadUrl(storagePath: string): string {
  const base = process.env.R2_PUBLIC_URL;
  if (!base) throw new Error("R2_PUBLIC_URL is not set");
  const trimmed = base.replace(/\/$/, "");
  return `${trimmed}/${storagePath}`;
}

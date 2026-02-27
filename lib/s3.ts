import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25MB

const getS3Client = () =>
    new S3Client({
        region: process.env.AWS_REGION ?? "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
        },
    });

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

export async function generatePresignedUploadUrl(
    key: string,
    contentType: string
): Promise<string> {
    const client = getS3Client();
    const bucket = process.env.AWS_S3_BUCKET;
    if (!bucket) throw new Error("AWS_S3_BUCKET is not configured");

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
    });

    return getSignedUrl(client, command, { expiresIn: 300 }); // 5 minutes
}

export function getPublicMediaUrl(key: string): string {
    const bucket = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION ?? "us-east-1";
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

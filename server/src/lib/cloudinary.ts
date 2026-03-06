import { v2 as cloudinary } from "cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;  // 5 MB
const MAX_GIF_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_SIZE = 25 * 1024 * 1024; // 25 MB

let configSet = false;

function ensureConfig() {
    if (configSet) return;

    const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
    const api_key = process.env.CLOUDINARY_API_KEY;
    const api_secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud_name || !api_key || !api_secret) {
        throw new Error(
            "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET"
        );
    }

    cloudinary.config({
        cloud_name,
        api_key,
        api_secret,
        secure: true,
    });
    configSet = true;
}

const ALLOWED_TYPES_REVERSE: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
};

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

export async function generateUploadSignature(publicId: string, fileType: string): Promise<{
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    publicUrl: string;
    publicId: string;
}> {
    ensureConfig();

    const timestamp = Math.round(new Date().getTime() / 1000);
    const isVideo = fileType.startsWith("video/");

    const signature = cloudinary.utils.api_sign_request(
        {
            timestamp,
            public_id: publicId,
        },
        process.env.CLOUDINARY_API_SECRET!
    );

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;

    // Predict the public URL based on Cloudinary's structure
    // 'video' resource_type handles both audio and video. 'image' handles images, gifs, svgs, etc.
    const resourceTypeObj = isVideo ? "video" : "image";
    const ext = ALLOWED_TYPES_REVERSE[fileType] || (isVideo ? "mp4" : "jpg"); // fallback
    const publicUrl = `https://res.cloudinary.com/${cloudName}/${resourceTypeObj}/upload/${publicId}.${ext}`;

    return {
        timestamp,
        signature,
        apiKey: process.env.CLOUDINARY_API_KEY!,
        cloudName,
        publicUrl,
        publicId,
    };
}

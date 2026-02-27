import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUploadUrl, getPublicMediaUrl, validateFileSize } from "@/lib/s3";
import { uploadMetaSchema } from "@/lib/schemas";
import { generateId } from "@/lib/nanoid";

const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "video/mp4": "mp4",
};

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = uploadMetaSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid upload metadata", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const { fileType, fileSize } = parsed.data;

    const ext = ALLOWED_TYPES[fileType];
    if (!ext) {
        return NextResponse.json(
            { error: "Unsupported file type. Allowed: JPG, PNG, WebP, MP4." },
            { status: 400 }
        );
    }

    const sizeCheck = validateFileSize(fileType, fileSize);
    if (!sizeCheck.valid) {
        return NextResponse.json({ error: sizeCheck.error }, { status: 400 });
    }

    const key = `uploads/${generateId()}.${ext}`;

    try {
        const uploadUrl = await generatePresignedUploadUrl(key, fileType);
        const publicUrl = getPublicMediaUrl(key);
        return NextResponse.json({ uploadUrl, publicUrl }, { status: 200 });
    } catch (err) {
        console.error("S3 presign error:", err);
        return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
    }
}

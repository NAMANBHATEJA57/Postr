import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/token";
import { ApiPostcardResponse } from "@/types/postcard";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    // Validate ID format
    if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
        return NextResponse.json({ error: "Invalid postcard ID" }, { status: 400 });
    }

    let postcard: Awaited<ReturnType<typeof prisma.postcard.findUnique>>;
    try {
        postcard = await prisma.postcard.findUnique({ where: { id } });
    } catch (err) {
        console.error("DB error:", err);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!postcard) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Expiry check
    if (postcard.expiryAt && postcard.expiryAt < new Date()) {
        return NextResponse.json({ error: "This postcard has expired" }, { status: 410 });
    }

    // Password protection check
    if (postcard.passwordHash) {
        const token = request.cookies.get(`access_${id}`)?.value;
        if (!token) {
            return NextResponse.json(
                { error: "Password required", isPasswordProtected: true },
                { status: 401 }
            );
        }
        const payload = await verifyAccessToken(token);
        if (!payload || payload.postcardId !== id) {
            return NextResponse.json(
                { error: "Invalid or expired session", isPasswordProtected: true },
                { status: 401 }
            );
        }
    }

    // Build safe response — never expose passwordHash
    const response: ApiPostcardResponse = {
        id: postcard.id,
        mediaUrl: postcard.mediaUrl,
        mediaType: postcard.mediaType as ApiPostcardResponse["mediaType"],
        title: postcard.title,
        message: postcard.message,
        toName: postcard.toName,
        fromName: postcard.fromName,
        theme: postcard.theme,
        expiryAt: postcard.expiryAt?.toISOString() ?? null,
        isPasswordProtected: Boolean(postcard.passwordHash),
        createdAt: postcard.createdAt.toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
}

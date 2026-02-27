import { NextRequest, NextResponse } from "next/server";
import { createPostcardSchema } from "@/lib/schemas";
import { generateId } from "@/lib/nanoid";
import { hashPassword } from "@/lib/password";
import { checkCreateLimit } from "@/lib/ratelimit";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { allowed, retryAfter } = checkCreateLimit(ip);

    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Try again later." },
            {
                status: 429,
                headers: { "Retry-After": String(retryAfter ?? 60) },
            }
        );
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createPostcardSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", issues: parsed.error.issues },
            { status: 400 }
        );
    }

    const { password, expiryAt, ...data } = parsed.data;

    const id = generateId();
    const passwordHash = password ? await hashPassword(password) : null;

    try {
        await prisma.postcard.create({
            data: {
                id,
                mediaUrl: data.mediaUrl,
                mediaType: data.mediaType,
                title: data.title,
                message: data.message,
                toName: data.toName,
                fromName: data.fromName,
                theme: data.theme,
                expiryAt: expiryAt ? new Date(expiryAt) : null,
                passwordHash,
            },
        });
    } catch (err) {
        console.error("DB create error:", err);
        return NextResponse.json({ error: "Failed to save postcard" }, { status: 500 });
    }

    return NextResponse.json({ id }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signAccessToken } from "@/lib/token";
import { checkPasswordLimit } from "@/lib/ratelimit";
import { unlockPostcardSchema } from "@/lib/schemas";

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const { id } = params;

    if (!/^[a-zA-Z0-9]{21}$/.test(id)) {
        return NextResponse.json({ error: "Invalid postcard ID" }, { status: 400 });
    }

    // Rate limit by IP + postcard ID: 5 attempts per 10 minutes
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const { allowed, retryAfter } = checkPasswordLimit(ip, id);

    if (!allowed) {
        return NextResponse.json(
            { error: "Too many password attempts. Wait a few minutes." },
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

    const parsed = unlockPostcardSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    let postcard: Awaited<ReturnType<typeof prisma.postcard.findUnique>>;
    try {
        postcard = await prisma.postcard.findUnique({ where: { id } });
    } catch {
        return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!postcard) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (postcard.expiryAt && postcard.expiryAt < new Date()) {
        return NextResponse.json({ error: "Expired" }, { status: 410 });
    }

    if (!postcard.passwordHash) {
        return NextResponse.json({ error: "Not password protected" }, { status: 400 });
    }

    const valid = await verifyPassword(parsed.data.password, postcard.passwordHash);
    if (!valid) {
        return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Issue HTTP-only access token
    const token = await signAccessToken(id);

    const response = NextResponse.json({ ok: true }, { status: 200 });
    response.cookies.set(`access_${id}`, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600, // 1 hour
        path: "/",
    });

    return response;
}

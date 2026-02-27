import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET environment variable is not set");
    return new TextEncoder().encode(secret);
};

export async function signAccessToken(postcardId: string): Promise<string> {
    return new SignJWT({ postcardId })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("1h")
        .sign(getSecret());
}

export async function verifyAccessToken(
    token: string
): Promise<{ postcardId: string } | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return { postcardId: payload.postcardId as string };
    } catch {
        return null;
    }
}

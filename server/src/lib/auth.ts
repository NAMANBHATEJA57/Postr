import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-256-bit-secret-this-is-a-development-key-only"
);

export interface JwtPayload {
    userId: string;
}

export async function signToken(payload: JwtPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("30d")
        .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as unknown as JwtPayload;
    } catch (error) {
        return null;
    }
}

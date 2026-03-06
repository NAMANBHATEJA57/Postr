import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Assumes ENCRYPTION_KEY environment variable is set (at least 32 chars).
 * Returns ciphertext format: iv:authTag:encryptedData
 */
export function encryptMessage(text: string): string {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY environment variable is not defined");
    }

    if (!text) return text; // Return as-is if empty

    const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag().toString("hex");

    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a ciphertext string formatted as iv:authTag:encryptedData.
 * Returns the original string if it is not in the encrypted format (backwards compatibility).
 */
export function decryptMessage(cipherText: string): string {
    if (!process.env.ENCRYPTION_KEY) {
        throw new Error("ENCRYPTION_KEY environment variable is not defined");
    }

    if (!cipherText) return cipherText;

    // Fast check for legacy unencrypted messages to support backwards compatibility
    const parts = cipherText.split(":");
    if (parts.length !== 3) {
        return cipherText;
    }

    try {
        const [ivHex, authTagHex, encryptedHex] = parts;

        // Verify hex integrity
        if (ivHex.length !== IV_LENGTH * 2 || authTagHex.length !== TAG_LENGTH * 2) {
            return cipherText;
        }

        const iv = Buffer.from(ivHex, "hex");
        const authTag = Buffer.from(authTagHex, "hex");
        const key = crypto.createHash("sha256").update(process.env.ENCRYPTION_KEY).digest();

        const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err) {
        // If decryption fails entirely, it might have been an ordinary text that coincidentally had two colons.
        // Or the key is wrong. For stability, return raw.
        console.error("Decryption failed. Returning raw ciphertext/string.", err);
        return cipherText;
    }
}

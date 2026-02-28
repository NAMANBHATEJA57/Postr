import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../password.js";

describe("password utilities", () => {
    it("hashPassword returns a string different from the input", async () => {
        const hash = await hashPassword("mysecretpassword");
        expect(typeof hash).toBe("string");
        expect(hash).not.toBe("mysecretpassword");
    });

    it("hashPassword produces a bcrypt hash (starts with $2)", async () => {
        const hash = await hashPassword("testpass");
        expect(hash).toMatch(/^\$2[ayb]\$/);
    });

    it("verifyPassword returns true for correct password", async () => {
        const password = "correct-horse-battery";
        const hash = await hashPassword(password);
        const result = await verifyPassword(password, hash);
        expect(result).toBe(true);
    });

    it("verifyPassword returns false for wrong password", async () => {
        const hash = await hashPassword("correct-password");
        const result = await verifyPassword("wrong-password", hash);
        expect(result).toBe(false);
    });

    it("verifyPassword is case-sensitive", async () => {
        const hash = await hashPassword("MyPassword");
        expect(await verifyPassword("mypassword", hash)).toBe(false);
        expect(await verifyPassword("MYPASSWORD", hash)).toBe(false);
        expect(await verifyPassword("MyPassword", hash)).toBe(true);
    });

    it("two hashes of the same password are different (salt uniqueness)", async () => {
        const password = "samepassword";
        const hash1 = await hashPassword(password);
        const hash2 = await hashPassword(password);
        // bcrypt salts ensure hashes differ
        expect(hash1).not.toBe(hash2);
        // but both verify correctly
        expect(await verifyPassword(password, hash1)).toBe(true);
        expect(await verifyPassword(password, hash2)).toBe(true);
    });

    it("handles minimum valid password (4 chars)", async () => {
        const hash = await hashPassword("1234");
        expect(await verifyPassword("1234", hash)).toBe(true);
    });

    it("handles long passwords up to bcrypt's 72-byte limit", async () => {
        // bcrypt silently truncates passwords at 72 bytes.
        // Use a 60-char password (well under the limit) with a unique ending character.
        const long = "a".repeat(59) + "Z"; // 60 chars
        const hash = await hashPassword(long);
        expect(await verifyPassword(long, hash)).toBe(true);
        // A password that differs before position 60 should not match
        const different = "b".repeat(59) + "Z";
        expect(await verifyPassword(different, hash)).toBe(false);
    });
});

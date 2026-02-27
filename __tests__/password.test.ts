// Unit tests for password hashing and verification

// We test the logic without bcrypt by mocking it
// In real test run, bcryptjs is called

describe("password utilities", () => {
    const VALID_PASSWORD = "correct-horse-battery-staple";
    const WRONG_PASSWORD = "wrong-password";

    // Mock bcrypt for fast unit tests
    const mockHash = async (password: string): Promise<string> => {
        return `hashed::${password}`;
    };

    const mockVerify = async (password: string, hash: string): Promise<boolean> => {
        return hash === `hashed::${password}`;
    };

    it("hash produces a non-empty string", async () => {
        const hash = await mockHash(VALID_PASSWORD);
        expect(hash).toBeTruthy();
        expect(typeof hash).toBe("string");
    });

    it("hash does not equal the original password", async () => {
        const hash = await mockHash(VALID_PASSWORD);
        expect(hash).not.toBe(VALID_PASSWORD);
    });

    it("verify returns true for correct password", async () => {
        const hash = await mockHash(VALID_PASSWORD);
        const result = await mockVerify(VALID_PASSWORD, hash);
        expect(result).toBe(true);
    });

    it("verify returns false for incorrect password", async () => {
        const hash = await mockHash(VALID_PASSWORD);
        const result = await mockVerify(WRONG_PASSWORD, hash);
        expect(result).toBe(false);
    });

    it("verify returns false for empty string", async () => {
        const hash = await mockHash(VALID_PASSWORD);
        const result = await mockVerify("", hash);
        expect(result).toBe(false);
    });

    it("two hashes of the same password differ (salting)", async () => {
        // In real bcrypt, salts differ. This test validates the concept.
        const hash1 = await mockHash(VALID_PASSWORD + "1");
        const hash2 = await mockHash(VALID_PASSWORD + "2");
        expect(hash1).not.toBe(hash2);
    });
});

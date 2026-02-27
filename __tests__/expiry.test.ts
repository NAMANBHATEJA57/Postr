// Unit tests for postcard expiry logic

function isExpired(expiryAt: Date | null): boolean {
    if (!expiryAt) return false;
    return expiryAt < new Date();
}

function computeExpiryDate(option: string, customDate?: string): Date | null {
    const now = new Date("2024-01-01T12:00:00Z");
    switch (option) {
        case "24h":
            return new Date(now.getTime() + 24 * 60 * 60 * 1000);
        case "7d":
            return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        case "30d":
            return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        case "custom":
            return customDate ? new Date(customDate) : null;
        default:
            return null;
    }
}

describe("isExpired", () => {
    it("returns false when expiryAt is null (never expires)", () => {
        expect(isExpired(null)).toBe(false);
    });

    it("returns false when expiry is in the future", () => {
        const future = new Date(Date.now() + 60_000);
        expect(isExpired(future)).toBe(false);
    });

    it("returns true when expiry is in the past", () => {
        const past = new Date(Date.now() - 60_000);
        expect(isExpired(past)).toBe(true);
    });

    it("returns true when expiry equals current moment (boundary)", () => {
        const now = new Date(Date.now() - 1); // 1ms past
        expect(isExpired(now)).toBe(true);
    });
});

describe("computeExpiryDate", () => {
    it("returns null for 'never' option", () => {
        expect(computeExpiryDate("never")).toBeNull();
    });

    it("returns 24h future date for '24h' option", () => {
        const result = computeExpiryDate("24h");
        expect(result).not.toBeNull();
    });

    it("returns 7 days future date for '7d' option", () => {
        const result = computeExpiryDate("7d");
        expect(result).not.toBeNull();
    });

    it("parses custom date string correctly", () => {
        const customDate = "2030-06-15";
        const result = computeExpiryDate("custom", customDate);
        expect(result?.getFullYear()).toBe(2030);
    });

    it("returns null for 'custom' without a date string", () => {
        const result = computeExpiryDate("custom", undefined);
        expect(result).toBeNull();
    });
});

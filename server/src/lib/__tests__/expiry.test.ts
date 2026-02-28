import { describe, it, expect } from "vitest";
import { isExpired } from "../expiry.js";

describe("isExpired", () => {
    const now = new Date("2026-02-28T12:00:00.000Z");

    it("returns false when expiryAt is null (never expires)", () => {
        expect(isExpired(null, now)).toBe(false);
    });

    it("returns false when expiryAt is undefined", () => {
        expect(isExpired(undefined, now)).toBe(false);
    });

    it("returns false when expiry is in the future", () => {
        const future = new Date(now.getTime() + 60_000).toISOString(); // +1 min
        expect(isExpired(future, now)).toBe(false);
    });

    it("returns true when expiry is in the past", () => {
        const past = new Date(now.getTime() - 60_000).toISOString(); // -1 min
        expect(isExpired(past, now)).toBe(true);
    });

    it("returns true when expiry equals exactly now (boundary)", () => {
        expect(isExpired(now.toISOString(), now)).toBe(true);
    });

    it("returns false for an invalid date string (graceful handling)", () => {
        expect(isExpired("not-a-date", now)).toBe(false);
    });

    it("handles 24h expiry correctly", () => {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        expect(isExpired(yesterday, now)).toBe(true);

        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        expect(isExpired(tomorrow, now)).toBe(false);
    });

    it("handles 7d expiry correctly", () => {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        expect(isExpired(sevenDaysAgo, now)).toBe(true);

        const inSevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
        expect(isExpired(inSevenDays, now)).toBe(false);
    });
});

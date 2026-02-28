/**
 * Expiry utility — thin helper to determine whether a postcard has expired.
 * Kept separate from route logic so it can be unit-tested without the full Express stack.
 */

/**
 * Returns true if the given ISO 8601 date string is in the past (or is exactly now).
 * Returns false if null/undefined (meaning "never expires").
 *
 * @param expiryAt - ISO 8601 string or null/undefined
 * @param now - optional override for "now" (defaults to Date.now()) useful for testing
 */
export function isExpired(
    expiryAt: string | null | undefined,
    now: Date = new Date()
): boolean {
    if (!expiryAt) return false;
    const expiry = new Date(expiryAt);
    if (isNaN(expiry.getTime())) return false; // invalid date — treat as non-expired
    return expiry <= now;
}

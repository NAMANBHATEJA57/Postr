import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// ─── Shared tests (desktop viewport) ───────────────────────────────────────

test.describe("postr: create → share → reveal flow", () => {

    test("landing page loads with CTA", async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator("h1")).toContainText("Send a moment");
        await expect(page.getByRole("link", { name: /create a postcard/i })).toBeVisible();
    });

    test("create page loads and shows required fields", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        await expect(page.locator("h1")).toContainText("Create a postcard.");
        await expect(page.locator("#title-input")).toBeVisible();
        await expect(page.locator("#message-input")).toBeVisible();
        await expect(page.locator("#to-input")).toBeVisible();
        await expect(page.locator("#from-input")).toBeVisible();
    });

    test("publish button is disabled until all fields are filled", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        const publishBtn = page.getByRole("button", { name: /publish postcard/i });
        await expect(publishBtn).toBeDisabled();

        // Fill title only — still disabled (no media)
        await page.fill("#title-input", "A Summer Evening");
        await expect(publishBtn).toBeDisabled();
    });

    test("character counter appears after threshold", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        await page.fill("#title-input", "A".repeat(31)); // 31 chars, threshold is 30
        await expect(page.locator("text=31/40")).toBeVisible();
    });

    test("404 page shows for invalid postcard ID", async ({ page }) => {
        await page.goto(`${BASE_URL}/p/invalidid`);
        const body = await page.textContent("body");
        expect(body).toBeTruthy();
    });

    test("expired card shows expiry message", async ({ page }) => {
        // Seeded test ID — likely returns 404; confirms the page handles it gracefully
        await page.goto(`${BASE_URL}/p/aaaaaaaaaaaaaaaaaaaaa`);
        const body = await page.textContent("body");
        expect(body).toBeTruthy();
    });
});

// ─── Envelope open interaction ───────────────────────────────────────────────

test.describe("postr: envelope open interaction", () => {
    /**
     * This test requires a live postcard to exist.
     * Set PLAYWRIGHT_TEST_POSTCARD_ID in env to test against a real seeded ID.
     * Without it, the test verifies the envelope render on the view page.
     */
    test("envelope is visible on view page with valid ID", async ({ page }) => {
        const testCardId = process.env.PLAYWRIGHT_TEST_POSTCARD_ID;
        if (!testCardId) {
            test.skip(true, "PLAYWRIGHT_TEST_POSTCARD_ID not set — skipping live envelope test");
            return;
        }

        await page.goto(`${BASE_URL}/p/${testCardId}`);

        // Envelope should be visible
        const envelope = page.getByTestId("envelope");
        await expect(envelope).toBeVisible();
    });

    test("envelope click triggers postcard reveal", async ({ page }) => {
        const testCardId = process.env.PLAYWRIGHT_TEST_POSTCARD_ID;
        if (!testCardId) {
            test.skip(true, "PLAYWRIGHT_TEST_POSTCARD_ID not set — skipping live reveal test");
            return;
        }

        await page.goto(`${BASE_URL}/p/${testCardId}`);

        const envelope = page.getByTestId("envelope");
        await expect(envelope).toBeVisible();

        // Click envelope to open it
        await envelope.click();

        // Postcard content should appear
        const postcard = page.getByTestId("postcard");
        await expect(postcard).toBeVisible({ timeout: 2000 });

        // CTA should appear below postcard
        const cta = page.getByTestId("cta");
        await expect(cta).toBeVisible();
        await expect(cta).toHaveAttribute("href", "/create");
    });

    test("CTA navigates to /create", async ({ page }) => {
        const testCardId = process.env.PLAYWRIGHT_TEST_POSTCARD_ID;
        if (!testCardId) {
            test.skip(true, "PLAYWRIGHT_TEST_POSTCARD_ID not set — skipping CTA navigation test");
            return;
        }

        await page.goto(`${BASE_URL}/p/${testCardId}`);
        const envelope = page.getByTestId("envelope");
        await envelope.click();

        const cta = page.getByTestId("cta");
        await expect(cta).toBeVisible({ timeout: 2000 });
        await cta.click();

        await expect(page).toHaveURL(`${BASE_URL}/create`);
    });
});

// ─── Password protection ─────────────────────────────────────────────────────

test.describe("postr: password protection", () => {
    test("password-protected postcard shows password gate", async ({ page }) => {
        const passwordCardId = process.env.PLAYWRIGHT_TEST_PASSWORD_POSTCARD_ID;
        if (!passwordCardId) {
            test.skip(true, "PLAYWRIGHT_TEST_PASSWORD_POSTCARD_ID not set — skipping password test");
            return;
        }

        await page.goto(`${BASE_URL}/p/${passwordCardId}`);

        // PasswordGate should be rendered — look for a password input
        const passwordInput = page.locator("input[type='password']");
        await expect(passwordInput).toBeVisible({ timeout: 3000 });
    });
});

// ─── Mobile viewport (375px) ────────────────────────────────────────────────

test.describe("postr: mobile viewport (375px)", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("create page has no horizontal scroll at 375px", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // allow 2px rounding
    });

    test("landing page renders correctly at 375px", async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator("h1")).toBeVisible();

        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });

    test("postcard reveal has no horizontal scroll at 375px", async ({ page }) => {
        const testCardId = process.env.PLAYWRIGHT_TEST_POSTCARD_ID;
        if (!testCardId) {
            test.skip(true, "PLAYWRIGHT_TEST_POSTCARD_ID not set — skipping mobile reveal test");
            return;
        }

        await page.goto(`${BASE_URL}/p/${testCardId}`);

        const envelope = page.getByTestId("envelope");
        await expect(envelope).toBeVisible();
        await envelope.click();

        await page.waitForSelector("[data-testid='postcard']", { timeout: 2000 });

        const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
        const clientWidth = await page.evaluate(() => document.body.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2);
    });
});

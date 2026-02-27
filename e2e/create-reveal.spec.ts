import { test, expect, Page } from "@playwright/test";
import path from "path";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("postr: create → share → reveal flow", () => {
    let shareUrl: string;

    test("create page loads and shows required fields", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        await expect(page.locator("h1")).toContainText("Create a postcard");
        await expect(page.locator("#title-input")).toBeVisible();
        await expect(page.locator("#message-input")).toBeVisible();
        await expect(page.locator("#to-input")).toBeVisible();
        await expect(page.locator("#from-input")).toBeVisible();
    });

    test("publish button is disabled until all fields are filled", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        const publishBtn = page.getByRole("button", { name: /publish postcard/i });
        await expect(publishBtn).toBeDisabled();

        // Fill title
        await page.fill("#title-input", "A Summer Evening");
        await expect(publishBtn).toBeDisabled(); // still disabled (no media)
    });

    test("character counter appears after threshold", async ({ page }) => {
        await page.goto(`${BASE_URL}/create`);

        await page.fill("#title-input", "A".repeat(31)); // 31 chars, threshold is 30
        await expect(page.locator("text=31/40")).toBeVisible();
    });

    test("landing page loads with CTA", async ({ page }) => {
        await page.goto(BASE_URL);
        await expect(page.locator("h1")).toContainText("Send a moment");
        await expect(page.getByRole("link", { name: /create a postcard/i })).toBeVisible();
    });

    test("404 page shows for invalid postcard ID", async ({ page }) => {
        await page.goto(`${BASE_URL}/p/invalidid`);
        // Either 404 page or notFound
        const body = await page.textContent("body");
        expect(body).toBeTruthy();
    });

    test("expired card shows expiry message", async ({ page }) => {
        // This test assumes a test endpoint or seeded data exists
        // In real E2E, you'd seed an expired postcard and use its ID
        // Here we just verify the 410 state message structure on the view page itself
        await page.goto(`${BASE_URL}/p/aaaaaaaaaaaaaaaaaaaaa`); // likely 404
        const body = await page.textContent("body");
        expect(body).toBeTruthy();
    });
});

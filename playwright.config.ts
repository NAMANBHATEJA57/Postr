import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    timeout: 30_000,
    expect: {
        timeout: 5_000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: {
                browserName: "chromium",
            },
        },
    ],
    // Start dev server automatically when running locally
    // Comment out if you prefer to start manually
    // webServer: {
    //     command: "npm run dev",
    //     url: "http://localhost:3000",
    //     reuseExistingServer: !process.env.CI,
    //     timeout: 120_000,
    // },
});

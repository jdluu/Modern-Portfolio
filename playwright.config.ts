import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    // Matches server.host/preview.host in astro.config.mjs: one address family
    // everywhere, so a probe and the tests cannot disagree about where the site is.
    baseURL: "http://127.0.0.1:4321",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm preview",
    url: "http://127.0.0.1:4321",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

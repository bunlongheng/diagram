import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:3002",
    headless: true,
  },
  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],
  // Boot the app for the test run. Locally, a dev server already on 3002 is
  // reused; in CI (and otherwise) build + start a fresh production server.
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3002",
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
});

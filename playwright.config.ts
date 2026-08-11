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
  // Runs `next dev`, not a production build: the local/LAN auth bypass in
  // lib/is-local.ts fires unconditionally on localhost under NODE_ENV=development,
  // which is the runtime these specs assume (see public.spec.ts's "local bypass is
  // active on localhost" comments). A production `next start` server requires
  // LOCAL_DEV=true for that same bypass, which would change the auth outcome these
  // tests were written against.
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3002",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

import { defineConfig, devices } from "@playwright/test";

// `npm run test:e2e` builds the site in demo mode (no Supabase keys, progress saved in the
// browser) and runs every browser test against it on port 3100, so it never touches real accounts.
// The accounts test only runs when E2E_ACCOUNTS_URL points at a running site that has keys.
const port = 3100;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 60_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 800 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
    { name: "tablet", testMatch: "pages.e2e.ts", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 } } },
  ],
  webServer: {
    command: `npm run build && npm run start -- -p ${port}`,
    url: `http://localhost:${port}`,
    // Building can be slow while OneDrive is syncing this folder.
    timeout: 360_000,
    reuseExistingServer: false,
    env: { NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" },
  },
});

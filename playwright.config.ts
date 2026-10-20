import { defineConfig, devices } from "@playwright/test";

const PORT = 3100; // not 3000, so it never clashes with `pnpm dev`

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // a stray test.only fails CI instead of skipping tests
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // Our visitors are on phones, so the tests are too.
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    // A real production build, using the fictional test content.
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}/testville`,
    env: { CONTENT_DIR: "tests/fixtures/content" },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});

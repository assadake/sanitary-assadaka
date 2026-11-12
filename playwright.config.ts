import { defineConfig } from "@playwright/test";

// The optional executable path is useful in environments with a preinstalled
// Chromium. Otherwise Playwright uses its own browser (npx playwright install).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    browserName: "chromium",
    reducedMotion: "reduce",
    launchOptions: executablePath ? { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] } : {},
  },
  webServer: {
    command: "npm run dev -- --host 0.0.0.0 --port 5173 --strictPort",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});

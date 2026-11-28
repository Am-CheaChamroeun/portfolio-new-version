import { defineConfig, devices } from '@playwright/test'

// Runs against the production build: `npm run build` first, then `npm run test:e2e` (it serves dist/ with `vite preview`).
export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    // optional local override (e.g. a system Chromium); CI uses the browser installed by `playwright install`
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run preview -- --port 4173 --strictPort', url: 'http://localhost:4173', reuseExistingServer: !process.env.CI, timeout: 60_000 },
})

import { defineConfig } from 'vitest/config'

// Unit tests only (pure logic + data checks). Browser flows live in e2e/ and run with Playwright.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    env: { VITE_CLOUDINARY_CLOUD_NAME: 'df3cyznc' },
  },
})

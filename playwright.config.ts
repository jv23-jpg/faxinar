import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  reporter: 'list',
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
  },
});

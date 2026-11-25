// End-to-end tests (Playwright). They drive a real browser against the running app, so start
// the backend (uv run fastapi dev app/main.py) and the frontend (npm run dev) first.
// Run: npm run test:e2e
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.js',
  timeout: 90_000, // first BigQuery queries can take a few seconds each
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    viewport: { width: 1440, height: 900 },
  },
})

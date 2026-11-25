import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // During development, send /api calls to the FastAPI backend on port 8000.
    proxy: { '/api': 'http://localhost:8000' },
  },
  // Unit tests (Vitest) live next to the code; e2e/ holds Playwright browser tests instead.
  test: { exclude: ['e2e/**', 'node_modules/**', 'dist/**'] },
})

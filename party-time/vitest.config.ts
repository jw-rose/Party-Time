import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // 'server-only' lives inside Next.js's compiled bundle and is not a
      // top-level package, so Vite can't resolve it in the jsdom test env.
      'server-only': path.resolve(__dirname, 'src/tests/__mocks__/server-only.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setup.ts'],
    exclude: [
      'node_modules/**',
      '.next/**',
      'src/tests/e2e/**',        // ← exclude Playwright tests
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.next/', 'src/tests/e2e/'],
    },
  },
})
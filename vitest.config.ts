import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['node_modules/**', 'e2e/**', '.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/lib/utils/**', 'src/features/**/schemas/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts'],
      thresholds: {
        'src/lib/utils/**': { lines: 100, functions: 100 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(__dirname, './src/tests/mocks/server-only.ts'),
    },
  },
})

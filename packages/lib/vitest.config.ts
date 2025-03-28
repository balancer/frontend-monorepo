import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@repo/lib': resolve(__dirname, '.'),
    },
  },
  envPrefix: ['VITE', 'NEXT'],
  test: {
    globals: true,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: process.env.SILENT_TESTS ? ['lcov'] : ['text', 'lcov'],
    }, // lcov reporter is used by IDE coverage extensions
    include: [
      './**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '!./**/*.integration.{test,spec}.*', // Exclude integration tests
      '!./**/*.script.{test,spec}.*', // Exclude script tests
    ],
    setupFiles: ['test/vitest/setup-vitest.tsx', 'test/vitest/setup-msw.ts'],
    // disable if parsing CSS is slow
    css: true,
  },
})

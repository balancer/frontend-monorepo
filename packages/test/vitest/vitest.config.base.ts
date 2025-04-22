import { ViteUserConfig } from 'vitest/config'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export function createVitestConfig(monorepoRoot: string): ViteUserConfig {
  const resolveFromRoot = (relativePath: string) => resolve(monorepoRoot, relativePath)

  console.log('resolveFromRoot(./packages', resolveFromRoot('./packages'))

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@repo': resolveFromRoot('./packages'),
        '@bal': resolveFromRoot('./apps/frontend-v3'),
      },
    },
    envPrefix: ['VITE', 'NEXT'],
    test: {
      globals: true,
      environment: 'happy-dom',
      coverage: {
        provider: 'v8',
        reporter: process.env.SILENT_TESTS ? ['lcov'] : ['text', 'lcov'],
      },
      include: [
        './**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '!./**/*.integration.{test,spec}.*',
        '!./**/*.script.{test,spec}.*',
      ],
      setupFiles: [
        resolveFromRoot('./packages/lib/test/vitest/setup-vitest.tsx'),
        resolveFromRoot('./packages/lib/test/vitest/setup-msw.ts'),
      ],
      css: true,
    },
  }
}

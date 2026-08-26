import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { createVitestConfig } from '../../packages/test/vitest/vitest.config.base'

const monorepoRoot = resolve(__dirname, '../..')

const baseConfig = createVitestConfig(monorepoRoot)

export default defineConfig({
  ...baseConfig,
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...(baseConfig.resolve?.alias as Record<string, string>),
      '~': resolve(__dirname, './lib'),
      // Mirrors the `@analytics/*` path mapping in tsconfig.json so specs
      // can import app modules the same way the source does.
      '@analytics': resolve(__dirname, '.'),
      // Next.js's `server-only` is a build-time virtual module; alias it to
      // a no-op stub so server-only modules are testable under vitest.
      'server-only': resolve(__dirname, './test/stubs/server-only.ts'),
    },
  },
  test: {
    ...baseConfig.test,
    passWithNoTests: true,
    // `@repo/lib/config/app.config.ts` throws at import when this is unset,
    // which breaks every spec that transitively imports `@repo/lib`. Provide
    // it here so the suite runs without a local `.env.local`.
    env: {
      NEXT_PUBLIC_BALANCER_API_URL: 'https://api-v3.balancer.fi/graphql',
    },
  },
})

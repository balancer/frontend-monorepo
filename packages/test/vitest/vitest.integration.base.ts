import { InlineConfig } from 'vitest/node'
import { resolve } from 'path'
import { createVitestConfig } from './vitest.config.base'
import { ViteUserConfig } from 'vitest/config'

export function createIntegrationVitestConfig(monorepoRoot: string): ViteUserConfig {
  function setupFilesWithoutMswSetup() {
    const setupFiles = vitestUnitConfig.test!.setupFiles! as string[]
    return setupFiles.filter(file => !file.includes('test/vitest/setup-msw.ts'))
  }

  const resolveFromRoot = (relativePath: string) => resolve(monorepoRoot, relativePath)

  const vitestUnitConfig = createVitestConfig(monorepoRoot)

  const integrationTestOptions: Partial<InlineConfig> = {
    include: ['./**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    // Integration tests call third-party endpoints (Balancer API, raw.githubusercontent.com)
    // that do not answer a browser preflight. happy-dom's fetch enforces the same-origin
    // policy, which blocks those responses and doubles every cross-origin POST with an
    // OPTIONS request. This is the setting happy-dom exposes for exactly that case.
    environmentOptions: {
      happyDOM: {
        settings: {
          fetch: {
            disableSameOriginPolicy: true,
          },
        },
      },
    },
    // Avoid msw in integration tests
    setupFiles: [
      ...setupFilesWithoutMswSetup(),
      resolveFromRoot('./packages/lib/test/vitest/setup-integration.ts'),
    ],
    globalSetup: [resolveFromRoot('./packages/test/anvil/anvil-global-setup.ts')],
    testTimeout: 120_000,
    hookTimeout: 120_000,
    // The integration suite shares one set of anvil forks. Keep test files serial so
    // concurrent workers do not overload or mutate the same forked RPC state.
    maxWorkers: 1,
    retry: 1,
    // Uncomment the next line to exclude test for debug reasons
    // exclude: ['lib/modules/tokens/useTokenBalances.integration.spec.ts', 'node_modules', 'dist'],
  }

  const integrationConfig = vitestUnitConfig

  integrationConfig.test = {
    ...integrationConfig.test,
    ...integrationTestOptions,
  }

  return integrationConfig
}

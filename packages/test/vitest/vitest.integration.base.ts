
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
    // Avoid msw in integration tests
    setupFiles: [
      ...setupFilesWithoutMswSetup(),
      resolveFromRoot('./packages/lib/test/vitest/setup-integration.ts'),
    ],
    globalSetup: [resolveFromRoot('./packages/test/anvil/anvil-global-setup.ts')],
    testTimeout: 30_000,
    // Consider disabling threads if we detect problems with anvil
    // poolOptions: {
    //   threads: { singleThread: true },
    // },
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

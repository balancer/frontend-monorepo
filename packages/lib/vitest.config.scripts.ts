import { InlineConfig } from 'vitest/node'
import vitestUnitConfig from './vitest.config'

/*
  Instead of using tsx or ts-node, we follow a pragmatic approach by overriding the existing vitest setup to run scripts,
  so files like foo.script.test.ts will be considered scripts.

  For now we only use it for saving api mocks but more scripts could be added in the future.

  Run it with: 'pnpm run test:save-api-mocks'
*/

function setupFilesWithoutMswSetup() {
  const setupFiles = vitestUnitConfig.test!.setupFiles! as string[]
  return setupFiles.filter(file => file !== 'test/vitest/setup-msw.ts')
}

const scriptTestOptions: Partial<InlineConfig> = {
  include: ['./**/*.script.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  // Avoid msw in integration tests
  setupFiles: [...setupFilesWithoutMswSetup()],
  testTimeout: 30_000,
  // Uncomment the next line to exclude test for debug reasons
  // exclude: ['lib/modules/tokens/useTokenBalances.integration.spec.ts', 'node_modules', 'dist'],
}

const scriptConfig = vitestUnitConfig

scriptConfig.test = {
  ...scriptConfig.test,
  ...scriptTestOptions,
}

export default scriptConfig

import { defineConfig } from 'vitest/config'
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
  return setupFiles.filter(file => !file.includes('setup-msw.ts'))
}

const scriptTestOptions: Partial<InlineConfig> = {
  include: ['./**/*.script.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  setupFiles: [...setupFilesWithoutMswSetup()],
  testTimeout: 30_000,
}

const scriptConfig = vitestUnitConfig

scriptConfig.test = {
  ...scriptConfig.test,
  ...scriptTestOptions,
}

export default defineConfig(scriptConfig)

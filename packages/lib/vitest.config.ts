import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import { createVitestConfig } from '../test/vitest/vitest.config.base'

const monorepoRoot = resolve(__dirname, '../..')

const baseConfig = createVitestConfig(monorepoRoot)

export default defineConfig({
  ...baseConfig,
})

import { resolve } from 'path'
import { defineConfig } from 'vitest/config'
import { createIntegrationVitestConfig } from '../../packages/test/vitest/vitest.integration.base'

const monorepoRoot = resolve(__dirname, '../..')

export default defineConfig(createIntegrationVitestConfig(monorepoRoot))

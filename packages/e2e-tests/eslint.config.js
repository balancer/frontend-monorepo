import baseConfig from '@repo/eslint-config/base'

/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  {
    // E2E tests-specific overrides can be added here
  },
]

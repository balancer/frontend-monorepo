import baseConfig from '@repo/eslint-config/base'

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [
      // Ignore dotfiles
      '.*.js',
      'node_modules/**',
      '**/generated/*.ts',
    ],
  },
  ...baseConfig,
  {
    // Lib-specific overrides can be added here
  },
]

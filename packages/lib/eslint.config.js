import baseConfig from '@repo/eslint-config/base'

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
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

import nextJsConfig from '@repo/eslint-config/next-js'

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    ignores: [
      '.*.js',
      '.next/**',
      '.turbo/**',
      'next-env.d.ts',
      'next.config.js',
      'node_modules/**',
    ],
  },
  ...nextJsConfig,
]

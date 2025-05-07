import nextJsConfig from '@repo/eslint-config/next-js'

/** @type {import("eslint").Linter.Config} */
export default [
  {
    ignores: [
      // Ignore dotfiles
      '.*.js',
      '.next/**',
      '.turbo/**',
      'v8-compile-cache-0/**',
      'next-env.d.ts',
      'next.config.js',
      'node_modules/**',
    ],
  },
  ...nextJsConfig,
  {
    // App-specific overrides can be added here
  },
]

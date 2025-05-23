import nextJsConfig from '@repo/eslint-config/next-js'

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
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
    rules: {
      // App-specific overrides can be added here
      'no-restricted-imports': [
        'error',
        {
          paths: [
            // Disable direct wagmi imports from balancer and beets apps to avoid WagmiProvider useConfig error (introduced by eslint 9 + nextjs 15)
            {
              name: 'wagmi',
              message: 'Import from @repo/lib/shared/utils/wagmi instead',
            },
            {
              name: 'wagmi/*',
              message: 'Import from @repo/lib/shared/utils/wagmi instead',
            },
          ],
        },
      ],
    },
  },
]

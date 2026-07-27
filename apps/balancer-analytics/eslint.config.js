import nextJsConfig from '@repo/eslint-config/next-js'

/** @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile} */
export default [
  {
    ignores: [
      '.*.js',
      '.next/**',
      '.turbo/**',
      'lib/generated/**',
      'next-env.d.ts',
      'next.config.js',
      'node_modules/**',
    ],
  },
  ...nextJsConfig,
  {
    rules: {
      // Analytics is read-only — wagmi is not in the provider tree, so any
      // accidental wagmi import would be a footgun. Block it at lint time.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'wagmi', message: 'Analytics app does not include wagmi providers.' },
            { name: 'wagmi/*', message: 'Analytics app does not include wagmi providers.' },
          ],
        },
      ],
    },
  },
  {
    // Standalone Node scripts (probe-swap-sources.mjs, future maintenance
    // tools). Not part of the Next.js build — runs under plain `node`, so
    // the globals it relies on are Node's, not the browser's.
    files: ['scripts/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        URL: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
  },
]

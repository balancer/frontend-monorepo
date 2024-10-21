const { resolve } = require('node:path')

const project = resolve(process.cwd(), 'tsconfig.json')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    require.resolve('@vercel/style-guide/eslint/next'),
    require.resolve('@vercel/style-guide/eslint/react'),
    'turbo',
    'prettier',
  ],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
  },
  plugins: ['@typescript-eslint', 'only-warn'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
  ],
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
  rules: {
    curly: ['error', 'multi-line'],
    'no-console': ['off'],
    'max-len': ['warn', { code: 120, ignoreComments: true, ignoreUrls: true }],
    '@typescript-eslint/no-explicit-any': ['off'],
    'no-html-link-for-pages': ['off'],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['wagmi'],
            importNames: ['useAccount'],
            message: 'Use useUserAccount instead to avoid hydration issues',
          },
          {
            group: ['wagmi/dist'],
            message: 'Invalid import: remove dist from import path',
          },
          {
            group: ['@apollo/client'],
            importNames: ['useQuery'],
            message:
              // eslint-disable-next-line max-len
              'Import useQuery from @apollo/experimental-nextjs-app-support/ssr to avoid u.inFlightLinkObservables errors',
          },
          {
            group: ['act'],
            importNames: ['react-dom/test-utils'],
            message: "Invalid import: import from '@testing-library/react' instead",
          },
        ],
      },
    ],
    'react/jsx-no-leaked-render': 'off',
  },
}

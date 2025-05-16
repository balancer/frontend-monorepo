import pluginReactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import pluginNext from '@next/eslint-plugin-next'
import baseConfig from './base.js'

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import("eslint").Linter.Config}
 */
const nextJsConfig = [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
    plugins: {
      '@next/next': pluginNext,
      'react-hooks': pluginReactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      ...pluginReactHooks.configs.recommended.rules,
      // Disable the no-html-link-for-pages rule or configure it with the correct pages path
      '@next/next/no-html-link-for-pages': 'off',
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
      // Custom rules from the original next.js config
      curly: ['error', 'multi-line'],
      'no-console': ['off'],
      'max-len': [
        'warn',
        {
          code: 120,
          ignoreComments: true,
          ignoreUrls: true,
          ignoreTemplateLiterals: true,
          ignoreStrings: true,
        },
      ],
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
              group: ['act'],
              importNames: ['react-dom/test-utils'],
              message: "Invalid import: import from '@testing-library/react' instead",
            },
          ],
        },
      ],
    },
  },
]

export default nextJsConfig

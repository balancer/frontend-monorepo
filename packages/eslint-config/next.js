import globals from 'globals'
import pluginNext from '@next/eslint-plugin-next'
import baseConfig from './base.js'

/**
 * A custom ESLint configuration for libraries that use Next.js.
 *
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile}
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
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
      // Disable the no-html-link-for-pages rule or configure it with the correct pages path
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
]

export default nextJsConfig

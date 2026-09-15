import globals from 'globals'
import baseConfig from './base.js'

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile}
 */
const reactInternalConfig = [
  ...baseConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
    settings: { react: { version: 'detect' } },
  },
]

export default reactInternalConfig

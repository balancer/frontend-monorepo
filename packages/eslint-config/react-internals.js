import pluginReactHooks from 'eslint-plugin-react-hooks'
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
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      // React scope no longer necessary with new JSX transform.
      'react/react-in-jsx-scope': 'off',
    },
  },
]

export default reactInternalConfig

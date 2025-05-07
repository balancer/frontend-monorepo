import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import turboPlugin from 'eslint-plugin-turbo'
import tseslint from 'typescript-eslint'
import onlyWarn from 'eslint-plugin-only-warn'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import globals from 'globals'
import { resolve } from 'node:path'

const project = resolve(process.cwd(), 'tsconfig.json')

/**
 * A shared ESLint configuration for the repository.
 * Based on the original library.js configuration, adapted for ESLint v9 flat config.
 *
 * @type {import("eslint").Linter.Config}
 */
const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: [
      // Ignore dotfiles
      '.*.js',
      'node_modules/**',
      'dist/**',
      '**/generated/*.ts',
      'theme.ts',
      '.next/**',
      '.turbo/**',
      'v8-compile-cache-0/**',
      'next-env.d.ts',
      'next.config.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        React: true,
        JSX: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      'only-warn': onlyWarn,
      turbo: turboPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project,
        },
      },
      react: {
        version: 'detect',
      },
    },
    rules: {
      'turbo/no-undeclared-env-vars': 'warn',
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
]

export default baseConfig

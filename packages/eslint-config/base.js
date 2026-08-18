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

// Statement types considered "multiline" by `padding-line-between-statements`
// below — anything whose declaration/body/expression spans more than one line.
const MULTILINE_STATEMENT_TYPES = [
  'multiline-block-like',
  'multiline-expression',
  'multiline-const',
  'multiline-let',
  'multiline-var',
]

/**
 * A shared ESLint configuration for the repository.
 * Based on the original library.js configuration, adapted for ESLint v9 flat config.
 *
 * @type {import('@typescript-eslint/utils').TSESLint.FlatConfig.ConfigFile}
 */
const baseConfig = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    ...reactPlugin.configs.flat.recommended,
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
      ...reactPlugin.configs.flat.recommended.languageOptions,
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
      // Disable the 'no-explicit-any' rule to prevent warnings about using 'any' type
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-sort-props': ['error', { ignoreCase: true }],
      // Disable react-hooks/exhaustive-deps rule
      'react-hooks/exhaustive-deps': 'off',
      curly: ['error', 'multi-line'],
      // Require a blank line before/after any statement that spans multiple
      // lines, so multiline blocks visually stand out from surrounding code.
      // Doesn't fire on the first/last statement in a block (no blank line
      // forced right after `{` or before `}`) since the rule only pads
      // between two consecutive statements.
      'padding-line-between-statements': [
        'error',
        { blankLine: 'always', prev: '*', next: MULTILINE_STATEMENT_TYPES },
        { blankLine: 'always', prev: MULTILINE_STATEMENT_TYPES, next: '*' },
        // Leading `;` ASI-safety guards (e.g. `;[a, b] = foo()`, used to
        // prevent the previous line from being parsed as a member/call
        // expression) are their own EmptyStatement immediately before the
        // real statement on the *same* source line. Without this exception,
        // the rule above sees `empty -> multiline-expression` as adjacent
        // statements and demands a blank line "before" a statement that's
        // actually glued to its guard. `blankLine: 'any'` must come after
        // the multiline entries so it wins for this specific pairing.
        { blankLine: 'any', prev: 'empty', next: '*' },
        { blankLine: 'any', prev: '*', next: 'empty' },
      ],
      'react/react-in-jsx-scope': 'off',
      'no-console': 'off',
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
              group: ['react-dom/test-utils'],
              importNames: ['act'],
              message: "Invalid import: import from '@testing-library/react' instead",
            },
          ],
        },
      ],
    },
  },
]

export default baseConfig

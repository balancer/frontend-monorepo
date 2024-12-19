export default {
  '*.{js,jsx,ts,tsx}': "eslint --fix --cache --max-warnings 0",
  '**/*.ts?(x)': 'bash -c "pnpm typecheck"',
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  '*.css': 'stylelint --fix',
}


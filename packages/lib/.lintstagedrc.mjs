export default {
  '*.{js,jsx,ts,tsx}': ['bash -c "pnpm lint:fix"'],
  '**/*.ts?(x)': 'bash -c "pnpm typecheck"',
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  '*.css': 'stylelint --fix',
}


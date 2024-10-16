module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'bash -c "pnpm run typecheck"'],
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  '*.css': 'stylelint --fix',
}

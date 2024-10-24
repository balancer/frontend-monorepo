module.exports = {
  '*.{js,jsx,ts,tsx}': ['pnpm lint:fix', 'bash -c "pnpm run typecheck"'],
  '*.{md,json,yaml,ts,tsx}': 'pnpm format:fix',
  '*.css': 'stylelint --fix',
};

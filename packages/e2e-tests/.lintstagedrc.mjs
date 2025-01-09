export default {
  '*.{jsx,ts,tsx}': 'eslint --fix --cache --max-warnings 0',
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  '*.css': 'stylelint --fix',
}

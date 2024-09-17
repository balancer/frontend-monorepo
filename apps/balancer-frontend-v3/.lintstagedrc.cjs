// https://nextjs.org/docs/pages/building-your-application/configuring/eslint#lint-staged

const path = require('path')

const buildEslintCommand = filenames =>
  `next lint --fix --max-warnings 0 --file ${filenames
    .map(f => path.relative(process.cwd(), f))
    .join(' --file ')}`

module.exports = {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, 'bash -c "pnpm run typecheck"'],
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  '*.css': 'stylelint --fix',
}

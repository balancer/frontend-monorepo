// https://nextjs.org/docs/pages/building-your-application/configuring/eslint#lint-staged
import baseConfig from '../../.lintstagedrc.cjs'
import path from 'path'

const buildEslintCommand = filenames =>
  `next lint --fix --max-warnings 0 --file ${filenames
    .map(f => path.relative(process.cwd(), f))
    .join(' --file ')}`

export default {
  ...baseConfig,
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, 'bash -c "pnpm run typecheck"'],
}

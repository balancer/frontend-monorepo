// https://nextjs.org/docs/pages/building-your-application/configuring/eslint#lint-staged
// import baseConfig from '../../.lintstagedrc.cjs'
import path from 'path'

const buildEslintCommand = filenames =>
  `next lint --fix --max-warnings 0 --file ${filenames
    .map(f => path.relative(process.cwd(), f))
    .join(' --file ')}`

const buildTypecheckCommand = filenames =>
  `tsc --project tsconfig.json --noEmit --file ${filenames
    .map(f => path.relative(process.cwd(), f))
    .join(' --file ')}`

const buildPrettierCommand = filenames =>
  `prettier --write ${filenames.join(' ')}`

const buildStylelintCommand = filenames =>
  `stylelint --fix ${filenames.join(' ')}`

export default {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand, buildTypecheckCommand, buildPrettierCommand, buildStylelintCommand],
  '*.{md,json,yaml,ts,tsx}': buildPrettierCommand,
  '*.css': buildStylelintCommand,
}

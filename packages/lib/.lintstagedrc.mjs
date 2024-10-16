import baseConfig from '../../.lintstagedrc.cjs'

export default {
  ...baseConfig,
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'bash -c "pnpm run typecheck"'],
}

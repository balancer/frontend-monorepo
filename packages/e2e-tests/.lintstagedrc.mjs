export default {
  '*.{md,json,yaml,ts,tsx}': 'prettier --write',
  'package.json': () => 'node scripts/sync-playwright-image.mjs',
}

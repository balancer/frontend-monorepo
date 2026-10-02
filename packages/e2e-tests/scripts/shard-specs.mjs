/*
  Resolves which spec files a CI job should run, at *file* granularity.

  Playwright's built-in --shard splits at test granularity, which cuts a single
  spec file across jobs. The dev E2E specs share anvil fork state between the
  tests in one file (liquidity-operations removes LP tokens minted by its own
  earlier tests), so a split file fails. This script keeps each file whole.

  Reads E2E_SHARD ("current/total", 1-based). Unset means "run everything", so
  the local scripts behave exactly as before.

  Usage: node scripts/shard-specs.mjs [dir]
*/
import { execFileSync } from 'node:child_process'

const dir = process.argv[2] ?? 'tests/dev/balancer'
const shard = process.env.E2E_SHARD
const isCi = !!process.env.CI

// Pool + LBP creation is disabled in the app (routes redirect to "/"), so its
// specs must not gate CI. The files stay runnable locally, where the creator is
// still reachable through the dev/staging nav.
const disabledOnCi = ['create-pool.spec.ts', 'create-lbp.spec.ts']

function isDisabled(file) {
  return isCi && disabledOnCi.some(name => file.endsWith(name))
}

// One "<path>:<line>:<col> › title" line per test: gives the file list plus a
// rough per-file cost to balance against.
function listTestsPerFile() {
  const listed = execFileSync(
    'pnpm',
    ['exec', 'playwright', 'test', dir, '--list', '--reporter=list'],
    {
      encoding: 'utf8',
    },
  )

  const testsPerFile = new Map()
  for (const line of listed.split('\n')) {
    const match = line.match(/(\S+\.spec\.[a-z]+):\d+:\d+/)
    if (!match) continue
    testsPerFile.set(match[1], (testsPerFile.get(match[1]) ?? 0) + 1)
  }

  if (testsPerFile.size === 0) {
    throw new Error(`No spec files found listing "${dir}"`)
  }

  return testsPerFile
}

// Local runs without a shard hand the whole dir to playwright. On CI the
// disabled specs still have to be dropped, so resolve the list explicitly.
if (!shard && !isCi) {
  console.log(dir)
  process.exit(0)
}

const [indexArg, totalArg] = (shard ?? '1/1').split('/')
const index = Number(indexArg)
const total = Number(totalArg)

if (
  !Number.isInteger(index) ||
  !Number.isInteger(total) ||
  index < 1 ||
  index > total ||
  total < 1
) {
  throw new Error(`Invalid E2E_SHARD "${shard}", expected "current/total" (1-based)`)
}

const entries = [...listTestsPerFile()].filter(([file]) => !isDisabled(file))

if (entries.length === 0) {
  // Never emit an empty list: `playwright test` with no args would run every
  // spec in testDir instead of none.
  throw new Error(`Every spec in "${dir}" is disabled on CI`)
}

// Greedy longest-processing-time packing: heaviest file into the emptiest shard.
// Adding a spec no longer means rebalancing a hardcoded list somewhere else.
const shards = Array.from({ length: total }, () => ({ load: 0, files: [] }))
const files = entries.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))

for (const [file, tests] of files) {
  const target = shards.reduce((min, shard) => (shard.load > min.load ? min : shard))
  target.load += tests
  target.files.push(file)
}

console.log(shards[index - 1].files.join(' '))

/*
  Keeps the mcr.microsoft.com/playwright container in checks.yml on the same
  version as @playwright/test.

  The container image ships the browsers, so the tag has to match the runner
  that drives them. When they drift, every E2E job dies at launch with
  "Executable doesn't exist at /ms-playwright/chromium_headless_shell-<build>".

  Renovate cannot keep them together: MCR's tags API returns no
  releaseTimestamp, so the container never participates in minimumReleaseAge
  and is always raised ahead of the npm package. This script closes that gap
  by deriving the tag from the npm version, which is the only source of truth.

  Usage: node scripts/sync-playwright-image.mjs [--check]

  --check exits 1 if anything would change, for use in CI.
*/
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(here, '../../..')
const packageJsonPath = resolve(here, '../package.json')
const checksPath = resolve(repoRoot, '.github/workflows/checks.yml')

// The image tag is "<version>-<distro>"; only the distro suffix is ours to keep.
const IMAGE_PATTERN =
  /mcr\.microsoft\.com\/playwright:v(\d+\.\d+\.\d+)(-[a-z]+)@sha256:[a-f0-9]{64}/g

const checkOnly = process.argv.includes('--check')

function readPlaywrightVersion() {
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
  const version = pkg.devDependencies?.['@playwright/test']
  if (!version) {
    throw new Error(`No @playwright/test in ${packageJsonPath}`)
  }
  return version
}

async function resolveDigest(tag) {
  const response = await fetch(`https://mcr.microsoft.com/v2/playwright/manifests/${tag}`, {
    method: 'HEAD',
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.list.v2+json',
    },
  })

  if (!response.ok) {
    throw new Error(`No such image tag "${tag}" (HTTP ${response.status})`)
  }

  const digest = response.headers.get('docker-content-digest')
  if (!digest) {
    throw new Error(`MCR returned no digest for "${tag}"`)
  }
  return digest
}

const version = readPlaywrightVersion()
const original = readFileSync(checksPath, 'utf8')

const tags = new Set([...original.matchAll(IMAGE_PATTERN)].map(match => `v${version}${match[2]}`))

if (tags.size === 0) {
  throw new Error(`No Playwright image references found in ${checksPath}`)
}

const digests = new Map()
for (const tag of tags) {
  digests.set(tag, await resolveDigest(tag))
}

const updated = original.replace(
  IMAGE_PATTERN,
  (_, _version, distro) =>
    `mcr.microsoft.com/playwright:v${version}${distro}@${digests.get(`v${version}${distro}`)}`,
)

if (updated === original) {
  console.log(`Playwright image already at v${version}`)
  process.exit(0)
}

if (checkOnly) {
  console.error(
    `Playwright image is out of sync with @playwright/test@${version}.\n` +
      `Run "pnpm sync:playwright" and commit the result.`,
  )
  process.exit(1)
}

writeFileSync(checksPath, updated)
console.log(`Playwright image updated to v${version}`)

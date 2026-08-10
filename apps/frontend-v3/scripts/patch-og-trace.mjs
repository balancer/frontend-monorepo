/* global process, console */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative } from 'node:path'

const require = createRequire(import.meta.url)

// The route's server trace (nft) is the upload manifest for the Vercel
// function. Turbopack's tracer follows only the static import graph, so files
// read at runtime (playwright-core's require('browsers.json'), the
// @sparticuz/chromium binary) are missing. Append them explicitly.
const NFT_PATH = '.next/server/app/api/og/pool/[chain]/[id]/route.js.nft.json'

async function collect() {
  // playwright-core exports package.json; its dir is the package root.
  const playwrightRoot = dirname(require.resolve('playwright-core/package.json'))
  const files = [join(playwrightRoot, 'browsers.json')]

  // @sparticuz/chromium does not export package.json; its main is build/index.js
  // so the package root is two levels up.
  const sparticuzRoot = dirname(dirname(require.resolve('@sparticuz/chromium')))
  const binDir = join(sparticuzRoot, 'bin')
  for (const name of await readdir(binDir)) {
    files.push(join(binDir, name))
  }

  return files
}

const nftPath = join(process.cwd(), NFT_PATH)
const nftDir = dirname(nftPath)
const nft = JSON.parse(await readFile(nftPath, 'utf8'))

let added = 0
for (const file of await collect()) {
  const rel = relative(nftDir, file).replace(/\\/g, '/')
  if (!nft.files.includes(rel)) {
    nft.files.push(rel)
    added++
  }
}

await writeFile(nftPath, JSON.stringify(nft))
console.log(`[og-trace] patched ${NFT_PATH}: added ${added} files`)

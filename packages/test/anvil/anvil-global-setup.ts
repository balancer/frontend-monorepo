import { loadEnvFile } from 'node:process'
import { dirname, resolve } from 'path'
import { Instance, Server } from 'prool'
import { fileURLToPath } from 'url'

import { ANVIL_NETWORKS, getForkUrl } from './anvil-setup'
import { testChains } from './testWagmiConfig'

const currentDir = dirname(fileURLToPath(import.meta.url))

function loadEnvFileIfExists(path: string) {
  try {
    loadEnvFile(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

loadEnvFileIfExists(resolve(currentDir, '../../../.env.local'))

async function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

async function waitForAnvilReady(port: number, chainName: string, maxAttempts = 90) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }),
      })

      if (response.ok) {
        console.log(`Anvil instance for ${chainName} (port ${port}) is ready`)
        return
      }
    } catch {
      // Proxy or anvil not yet listening
    }

    if (i > 0 && i % 10 === 0) {
      console.log(`Waiting for anvil ${chainName} (port ${port})... ${i}s`)
    }

    await sleep(1000)
  }

  throw new Error(`Anvil instance for ${chainName} (port ${port}) did not become ready in time`)
}

export async function setup() {
  const promises = []

  for (const chain of Object.values(testChains)) {
    const forkUrl = getForkUrl(chain.id, false)

    console.log('Starting proxy ', {
      port: chain.port,
      forkUrl,
      forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
    })

    const server = Server.create({
      port: chain.port,
      host: '::',
      instance: Instance.anvil({
        chainId: chain.id,
        forkUrl,
        forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
        mnemonic: process.env.TEST_ACCOUNT_MNEMONIC,
      }),
    })

    promises.push(server.start().then(() => server.stop.bind(server)))
  }

  const results = await Promise.all(promises)

  // Warm up each anvil instance so the first test using a chain doesn't hit a cold fork
  await Promise.all(
    Object.values(testChains).map(chain => waitForAnvilReady(chain.port, chain.name))
  )

  return async () => {
    await Promise.all(results.map(shutdown => shutdown()))
  }
}

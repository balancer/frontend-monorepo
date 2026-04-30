import { startProxy } from '@viem/anvil'
import { loadEnvFile } from 'node:process'
import { dirname, resolve } from 'path'
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

export async function setup() {
  const promises = []
  for (const chain of Object.values(testChains)) {
    console.log('Starting proxy ', {
      port: chain.port,
      forkUrl: getForkUrl(chain.id, false),
      forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
    })
    promises.push(
      startProxy({
        port: chain.port,
        host: '::',
        options: {
          chainId: chain.id,
          forkUrl: getForkUrl(chain.id, false),
          forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
          noMining: false,
          mnemonic: process.env.TEST_ACCOUNT_MNEMONIC,
        },
      })
    )
  }
  const results = await Promise.all(promises)
  // Wait for the proxy to start
  await sleep(2000)

  return () => {
    for (const shutdown of results) {
      shutdown()
    }
  }
}

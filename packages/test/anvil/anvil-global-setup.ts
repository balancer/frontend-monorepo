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
  // Wait for the proxy to start
  await sleep(2000)

  return async () => {
    await Promise.all(results.map(shutdown => shutdown()))
  }
}

import { startProxy } from '@viem/anvil'

import { ANVIL_NETWORKS, getForkUrl } from './anvil-setup'
import { testChains } from './testWagmiConfig'
import { sleep } from '@repo/lib/shared/utils/sleep'

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

import { startProxy } from '@viem/anvil'

import { ANVIL_NETWORKS, getForkUrl } from './anvil-setup'
import { testChains } from './testWagmiConfig'
import { sleep } from '@/lib/shared/utils/sleep'

export async function setup() {
  const promises = []
  for (const chain of Object.values(testChains)) {
    console.log('Starting proxy ', {
      port: chain.port,
      forkUrl: getForkUrl(chain.name, false),
      forkBlockNumber: ANVIL_NETWORKS[chain.name].forkBlockNumber,
    })
    promises.push(
      startProxy({
        port: chain.port,
        host: '::',
        options: {
          chainId: chain.id,
          forkUrl: getForkUrl(chain.name, false),
          forkBlockNumber: ANVIL_NETWORKS[chain.name].forkBlockNumber,
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

import { chainsByKey } from '@repo/lib/modules/web3/ChainConfig'
import * as transportsModule from '@repo/lib/modules/web3/transports'
import { ChainIdWithFork, getTestRpcSetup } from '@repo/test/anvil/anvil-setup'
import { sonicTest } from '@repo/test/anvil/testWagmiConfig'
import {
  connectWithDefaultUser,
  disconnectDefaultUser,
} from '@repo/test/utils/wagmi/wagmi-connections'
import { configure } from '@testing-library/react'
import { createPublicClient, http } from 'viem'

// Integration tests hit anvil proxies over network; CI runners need more time
configure({ asyncUtilTimeout: 30_000 })

/*
  Specific setup for integration tests (that it is not needed in unit tests)
*/
beforeAll(async () => {
  // The suite runs against the Sonic fork, which is the only chain Beets supports
  await connectWithDefaultUser()
})

afterAll(async () => {
  await disconnectDefaultUser()
})

/*
  Mocks getDefaultRpcUrl to return the test rpcUrl ('http://127.0.0.1:port/poolId')
  Keeps the rest of the module unmocked
*/
vi.mock('@repo/lib/modules/web3/transports', async importOriginal => {
  const originalModule = await importOriginal<typeof transportsModule>()
  return {
    ...originalModule,
    getRpcUrl: (chainId: number) => {
      const { rpcUrl } = getTestRpcSetup(chainsByKey[chainId]!.id as ChainIdWithFork)
      return rpcUrl
    },
  }
})

/*
  Mocks getViemClient to use the test chain definition,
  which uses a test rpcUrl ('http://127.0.0.1:port/poolId')
*/
vi.mock('@repo/lib/shared/services/viem/viem.client', () => {
  return {
    getViemClient: () => {
      return createPublicClient({
        chain: sonicTest,
        transport: http(),
      })
    },
  }
})

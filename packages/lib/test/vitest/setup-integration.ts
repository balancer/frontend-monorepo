import { chainsByKey } from '@repo/lib/modules/web3/ChainConfig'
import * as transportsModule from '@repo/lib/modules/web3/transports'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { ChainIdWithFork, getTestRpcSetup } from '@repo/test/anvil/anvil-setup'
import { mainnetTest, polygonTest } from '@repo/test/anvil/testWagmiConfig'
import {
  connectWithDefaultUser,
  disconnectDefaultUser,
} from '@repo/test/utils/wagmi/wagmi-connections'
import { createPublicClient, http } from 'viem'

/*
  Specific setup for integration tests (that it is not needed in unit tests)
*/
beforeAll(async () => {
  // By default all the integration tests use MAINNET
  // If not, they must explicitly call startFork(<networkName>)
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
      const { rpcUrl } = getTestRpcSetup(chainsByKey[chainId].id as ChainIdWithFork)
      return rpcUrl
    },
  }
})

/*
  Mocks getViemClient to use the test chain definitions,
  which use test rpcUrls ('http://127.0.0.1:port/poolId')
*/
vi.mock('@repo/lib/shared/services/viem/viem.client', () => {
  return {
    getViemClient: (chain: GqlChain) => {
      return createPublicClient({
        chain: chain === GqlChain.Mainnet ? mainnetTest : polygonTest,
        transport: http(),
      })
    },
  }
})

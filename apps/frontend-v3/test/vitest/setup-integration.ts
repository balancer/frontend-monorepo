import { connectWithDefaultUser, disconnectDefaultUser } from '../utils/wagmi/wagmi-connections'
import * as transportsModule from '../../lib/modules/web3/transports'
import { NetworksWithFork, getTestRpcSetup } from '../anvil/anvil-setup'
import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { createPublicClient, http } from 'viem'
import { mainnetTest, polygonTest } from '../anvil/testWagmiConfig'
import { chainsByKey } from '@/lib/modules/web3/ChainConfig'

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
vi.mock('../../lib/modules/web3/transports', async importOriginal => {
  const originalModule = await importOriginal<typeof transportsModule>()
  return {
    ...originalModule,
    getRpcUrl: (chainId: number) => {
      const { rpcUrl } = getTestRpcSetup(chainsByKey[chainId].name as NetworksWithFork)
      return rpcUrl
    },
  }
})

/*
  Mocks getViemClient to use the test chain definitions,
  which use test rpcUrls ('http://127.0.0.1:port/poolId')
*/
vi.mock('../../lib/shared/services/viem/viem.client', () => {
  return {
    getViemClient: (chain: GqlChain) => {
      return createPublicClient({
        chain: chain === GqlChain.Mainnet ? mainnetTest : polygonTest,
        transport: http(),
      })
    },
  }
})

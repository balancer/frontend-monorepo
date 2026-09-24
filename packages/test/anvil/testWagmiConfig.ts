import { ChainIdWithFork, getTestRpcSetup, testAccounts } from '@repo/test/anvil/anvil-setup'
import { Address, Chain, http } from 'viem'
import { sonic } from 'viem/chains'
import { createConfig } from 'wagmi'
import { mock } from 'wagmi/connectors'

const TEST_RPC_TIMEOUT_MS = 60_000

/*
  Sonic is the only chain the Beets integration suite forks (see forkedChainIds in
  anvil-setup), so it is the only chain configured here. A chain without a running fork would
  resolve to a dead local rpc url and fail with a confusing timeout instead of a clear error.
*/
export const sonicTest = {
  ...sonic,
  ...getTestRpcUrls(sonic.id),
} as const satisfies Chain

export const testChains = [sonicTest] as const satisfies readonly Chain[]

function getTestRpcUrls(chainId: ChainIdWithFork) {
  const { port, rpcUrl } = getTestRpcSetup(chainId)
  return {
    port,
    rpcUrls: {
      // These rpc urls are automatically used in the transports.
      default: {
        http: [rpcUrl],
      },
      public: {
        http: [rpcUrl],
      },
    },
  } as const
}

export let testWagmiConfig = createTestWagmiConfig() as any

function createTestWagmiConfig() {
  return createConfig({
    chains: testChains,
    connectors: testAccounts.map(testAccount => mock({ accounts: [testAccount] })),
    pollingInterval: 100,
    storage: null,
    transports: {
      [sonicTest.id]: http(undefined, { timeout: TEST_RPC_TIMEOUT_MS }),
    },
    ssr: false,
  })
}

// Allows tests dynamically connecting to any test account
export function addTestUserAddress(testAccount: Address) {
  if (testAccounts.includes(testAccount)) return
  testAccounts.push(testAccount)
  testWagmiConfig = createTestWagmiConfig()
}

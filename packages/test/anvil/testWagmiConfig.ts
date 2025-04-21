import { ChainIdWithFork, getTestRpcSetup, testAccounts } from '@repo/test/anvil/anvil-setup'
import { Address, Chain, http } from 'viem'
import { gnosis, mainnet, polygon, sepolia, fantom, sonic } from 'viem/chains'
import { createConfig } from 'wagmi'
import { mock } from 'wagmi/connectors'

export const mainnetTest = {
  ...mainnet,
  ...getTestRpcUrls(mainnet.id),
} as const satisfies Chain

export const polygonTest = {
  ...polygon,
  ...getTestRpcUrls(polygon.id),
} as const satisfies Chain

export const sepoliaTest = {
  ...sepolia,
  ...getTestRpcUrls(sepolia.id),
} as const satisfies Chain

export const fantomTest = {
  ...fantom,
  ...getTestRpcUrls(fantom.id),
} as const satisfies Chain

export const gnosisTest = {
  ...gnosis,
  ...getTestRpcUrls(gnosis.id),
} as const satisfies Chain

export const sonicTest = {
  ...sonic,
  ...getTestRpcUrls(sonic.id),
} as const satisfies Chain

export const testChains = [
  mainnetTest,
  polygonTest,
  sepoliaTest,
  gnosisTest,
  fantomTest,
  sonicTest,
] as const

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

export let testWagmiConfig = createTestWagmiConfig()

function createTestWagmiConfig() {
  return createConfig({
    chains: testChains,
    connectors: testAccounts.map(testAccount => mock({ accounts: [testAccount] })),
    pollingInterval: 100,
    storage: null,
    transports: {
      [mainnetTest.id]: http(),
      [polygonTest.id]: http(),
      [sepoliaTest.id]: http(),
      [fantomTest.id]: http(),
      [gnosisTest.id]: http(),
      [sonicTest.id]: http(),
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

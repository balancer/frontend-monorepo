import { testWagmiConfig } from '@repo/lib/test/anvil/testWagmiConfig'
import { publicActions, testActions, walletActions } from 'viem'
import { gnosis, mainnet, polygon, sepolia, fantom } from 'viem/chains'

export function createTestHttpClient(chainId: 1 | 137 | 11155111 | 100 | 250) {
  return testWagmiConfig
    .getClient({ chainId })
    .extend(testActions({ mode: 'anvil' }))
    .extend(publicActions)
    .extend(walletActions)
}

export const mainnetTestPublicClient = createTestHttpClient(mainnet.id)
export const polygonTestPublicClient = createTestHttpClient(polygon.id)
export const sepoliaTestPublicClient = createTestHttpClient(sepolia.id)
export const fantomTestPublicClient = createTestHttpClient(fantom.id)
export const gnosisTestPublicClient = createTestHttpClient(gnosis.id)

import { ChainIdWithFork } from '@repo/test/anvil/anvil-setup'
import { testWagmiConfig } from '@repo/test/anvil/testWagmiConfig'
import { publicActions, testActions, walletActions } from 'viem'
import { fantom, gnosis, mainnet, polygon, sepolia } from 'viem/chains'

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

export function getTestClient(chainId: ChainIdWithFork) {
  switch (chainId) {
    case mainnet.id:
      return mainnetTestPublicClient
    case polygon.id:
      return polygonTestPublicClient
    case sepolia.id:
      return sepoliaTestPublicClient
    case fantom.id:
      return fantomTestPublicClient
    case gnosis.id:
      return gnosisTestPublicClient
    default:
      throw new Error(`No test client for chainId ${chainId}`)
  }
}

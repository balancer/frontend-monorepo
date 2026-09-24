import { ChainIdWithFork } from '@repo/test/anvil/anvil-setup'
import { testWagmiConfig } from '@repo/test/anvil/testWagmiConfig'
import { publicActions, testActions, walletActions } from 'viem'
import { sonic } from 'viem/chains'

export function createTestHttpClient(chainId: ChainIdWithFork) {
  return testWagmiConfig
    .getClient({ chainId })
    .extend(testActions({ mode: 'anvil' }))
    .extend(publicActions)
    .extend(walletActions)
}

export const sonicTestPublicClient = createTestHttpClient(sonic.id)

export function getTestClient(chainId: ChainIdWithFork) {
  if (chainId === sonic.id) return sonicTestPublicClient

  throw new Error(
    `No test client for chainId ${chainId}. Only forked chains have one, see forkedChainIds in anvil-setup.`
  )
}

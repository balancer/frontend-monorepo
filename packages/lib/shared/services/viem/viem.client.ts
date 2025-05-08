import { createPublicClient } from 'viem'
import { GqlChain } from '../api/generated/graphql'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { chains, chainsByKey } from '@repo/lib/modules/web3/ChainConfig'
import { Chain } from 'viem'
import { getTransports } from '@repo/lib/modules/web3/transports'

function getViemChain(chainId: number): Chain {
  const chain = chains.find(chain => chain.id === chainId)
  if (!chain) throw new Error('Chain not supported')
  // TODO: are AppKit Chain and Chain types compatible?
  return chain as Chain
}

export function getViemClient(chain: GqlChain) {
  const { chainId } = getNetworkConfig(chain)

  return createPublicClient({
    chain: getViemChain(chainId),
    transport: getTransports(chainsByKey[chainId]),
  })
}

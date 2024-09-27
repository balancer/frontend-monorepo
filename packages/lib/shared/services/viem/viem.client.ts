import { createPublicClient } from 'viem'
import { GqlChain } from '../api/generated/graphql'
import { getNetworkConfig } from '../../../config/app.config'
import { chains, chainsByKey } from '../../../modules/web3/ChainConfig'
import { Chain } from 'viem'
import { getTransports } from '../../../modules/web3/transports'

function getViemChain(chainId: number): Chain {
  const chain = chains.find(chain => chain.id === chainId)
  if (!chain) throw new Error('Chain not supported')
  return chain
}

export function getViemClient(chain: GqlChain) {
  const { chainId } = getNetworkConfig(chain)

  return createPublicClient({
    chain: getViemChain(chainId),
    transport: getTransports(chainsByKey[chainId]),
  })
}

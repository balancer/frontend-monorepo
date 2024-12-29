'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useReadContract } from 'wagmi'

export function useGetRate(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getRate',
    args: [],
    query: { enabled: true },
  })

  return {
    ...query,
    rate: query.data ?? 10n ** 18n,
  }
}

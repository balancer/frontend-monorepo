'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useBatchedReadContract } from '@repo/lib/modules/web3/useBatchedReadContract'
import { useMemo } from 'react'

export function useGetRate(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const queryConfig = useMemo(
    () => ({
      chainId,
      abi: sonicStakingAbi,
      address: config.contracts.beets?.lstStakingProxy,
      functionName: 'getRate',
      args: [],
      query: {
        enabled: !!config.contracts.beets?.lstStakingProxy,
      },
    }),
    [chainId, config.contracts.beets?.lstStakingProxy]
  )

  const query = useBatchedReadContract(queryConfig)

  return {
    ...query,
    rate: query.data ?? 10n ** 18n,
  }
}

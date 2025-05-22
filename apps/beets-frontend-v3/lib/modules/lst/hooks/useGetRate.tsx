'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { sonicStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { useReadContract } from '@repo/lib/shared/hooks/useReadContractHelper'

export function useGetRate(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: sonicStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getRate',
    args: [],
    query: {
      enabled: true,
    },
  })

  const rate = query.data ? BigInt(query.data as unknown as string | number | bigint) : 10n ** 18n

  return {
    ...query,
    rate,
  } as const
}

'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { beetsFtmStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetStakedAmountPreview(amount: bigint, chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: beetsFtmStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getFTMxAmountForFTM',
    args: [amount, false],
    query: { enabled: isConnected && !shouldChangeNetwork && !!amount },
  })

  return {
    ...query,
    stakedAmountPreview: query.data ?? 0n,
  }
}

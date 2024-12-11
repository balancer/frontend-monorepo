'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { beetsFtmStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetPenalty(amount: bigint, chain: GqlChain) {
  const { isConnected } = useUserAccount()

  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: beetsFtmStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'calculatePenalty',
    args: [amount],
    query: { enabled: isConnected && !shouldChangeNetwork && !!amount },
  })

  return {
    ...query,
    penalty: query.data?.[2] ?? 0n,
  }
}

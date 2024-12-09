'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { beetsFtmStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { formatUnits } from 'viem'

export function useGetExchangeRate(chain: GqlChain) {
  const { isConnected } = useUserAccount()

  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: beetsFtmStakingAbi,
    address: config.contracts.beets?.lstStakingProxy,
    functionName: 'getExchangeRate',
    args: [],
    query: { enabled: isConnected && !shouldChangeNetwork },
  })

  return {
    ...query,
    exchangeRate: formatUnits(query.data ?? 1n, 18),
  }
}

'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { vaultAdminAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetMinimumWrapAmount(chain: GqlChain) {
  const { isConnected } = useUserAccount()
  const chainId = getChainId(chain)

  const { shouldChangeNetwork } = useChainSwitch(chainId)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: vaultAdminAbi,
    address: config.contracts.balancer.vaultV3,
    functionName: 'getMinimumWrapAmount',
    args: [],
    query: { enabled: isConnected && !shouldChangeNetwork },
  })

  return {
    ...query,
    minimumWrapAmount: query.data ?? 0n,
  }
}

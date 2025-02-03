'use client'

import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useReadContract } from 'wagmi'
import { vaultAdminAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export function useGetMinimumWrapAmount(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: vaultAdminAbi,
    address: config.contracts.balancer.vaultAdmin,
    functionName: 'getMinimumWrapAmount',
  })

  return {
    ...query,
    minimumWrapAmount: query.data ?? 0n,
  }
}

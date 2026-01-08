import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '../services/api/generated/graphql'
import { useReadContract } from 'wagmi'
import { vaultAdminAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

export function useGetMinimumTradeAmount(chain: GqlChain) {
  const chainId = getChainId(chain)
  const config = getNetworkConfig(chainId)

  const query = useReadContract({
    chainId,
    abi: vaultAdminAbi,
    address: config.contracts.balancer.vaultAdminV3,
    functionName: 'getMinimumTradeAmount',
  })

  return {
    ...query,
    minimumTradeAmount: query.data ?? 0n,
  }
}

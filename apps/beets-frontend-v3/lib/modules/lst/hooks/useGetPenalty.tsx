import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { useLst } from '../LstProvider'
import { beetsFtmStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

export function useGetPenalty(amount: bigint) {
  const { isConnected } = useUserAccount()
  const { chain } = useLst()
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

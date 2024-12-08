import { getChainId, getNetworkConfig } from '@repo/lib/config/app.config'
import { useChainSwitch } from '@repo/lib/modules/web3/useChainSwitch'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { useLst } from '../LstProvider'
import { beetsFtmStakingAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

export function useGetStakedAmount(amount: bigint) {
  const { isConnected } = useUserAccount()
  const { chain } = useLst()
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
    stakedAmount: query.data ?? 0n,
  }
}

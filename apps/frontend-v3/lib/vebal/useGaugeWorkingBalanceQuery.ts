import { useReadContract } from 'wagmi'
import { Address } from '@balancer/sdk'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { GaugeWorkingBalanceHelperAbi } from '@repo/lib/modules/web3/contracts/abi/GaugeWorkingBalanceHelperAbi'

export function useGaugeWorkingBalanceQuery(
  chainId: number,
  contractAddress: Address,
  gauge: string,
  userAddress: string
) {
  const { isConnected } = useUserAccount()

  return useReadContract({
    chainId: chainId,
    address: contractAddress,
    abi: GaugeWorkingBalanceHelperAbi,
    functionName: 'getWorkingBalanceToSupplyRatios',
    args: [gauge, userAddress],
    query: {
      enabled: isConnected,
    },
  })
}

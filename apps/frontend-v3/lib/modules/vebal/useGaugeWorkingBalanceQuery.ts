import { useReadContract } from 'wagmi'
import { GaugeWorkingBalanceHelperAbi } from '../web3/contracts/abi/GaugeWorkingBalanceHelperAbi'
import { Address } from '@balancer/sdk'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'

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

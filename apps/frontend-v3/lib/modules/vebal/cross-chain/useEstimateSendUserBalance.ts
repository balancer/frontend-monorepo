import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
import { useReadContract } from 'wagmi'
import { OmniVotingEscrowAbi } from '@/lib/modules/web3/contracts/abi/OmniVotingEscrowAbi'
import { Address } from 'viem'
import { useNetworkConfig } from '@/lib/config/useNetworkConfig'
import { bn } from '@/lib/shared/utils/numbers'

export function useEstimateSendUserBalance(tokenAddress: Address, layerZeroChainId: number) {
  const { userAddress } = useUserAccount()

  const { chainId } = useNetworkConfig()

  return useReadContract({
    chainId,
    abi: OmniVotingEscrowAbi,
    functionName: 'estimateSendUserBalance',
    address: tokenAddress,
    args: [layerZeroChainId],
    account: userAddress,
    query: {
      enabled: !!userAddress,
      select: _data => {
        const [nativeFee, zroFee] = _data
        return { nativeFee: bn(nativeFee), zroFee: bn(zroFee) }
      },
    },
  })
}

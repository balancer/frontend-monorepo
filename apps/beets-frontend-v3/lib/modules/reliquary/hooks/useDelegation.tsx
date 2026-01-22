import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useReadContract } from '@repo/lib/shared/utils/wagmi'
import { DelegateRegistryAbi } from '@repo/lib/modules/web3/contracts/abi/DelegateRegistryAbi'
import { zeroHash } from 'viem'

export function useDelegation() {
  const { userAddress } = useUserAccount()
  const networkConfig = useNetworkConfig()

  const { data: delegationAddress, refetch } = useReadContract({
    address: networkConfig.snapshot?.contractAddress,
    abi: DelegateRegistryAbi,
    functionName: 'delegation',
    args: [userAddress, networkConfig.snapshot?.id ?? zeroHash],
    query: {
      enabled: !!userAddress && !!networkConfig.snapshot,
    },
  })

  const isDelegatedToMDs =
    !!delegationAddress &&
    !!networkConfig.snapshot?.delegateAddress &&
    delegationAddress === networkConfig.snapshot.delegateAddress

  return {
    data: isDelegatedToMDs,
    delegationAddress,
    refetch,
  }
}

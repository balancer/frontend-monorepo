import { Address, isAddress, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'
import { getChainId } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export const usePoolHooksContract = (address: string | undefined, network: GqlChain) => {
  const isZeroAddress = address === zeroAddress
  const enabled = !!address && isAddress(address) && !isZeroAddress

  const { data: hookFlags } = useReadContract({
    address: address as Address,
    abi: reClammPoolAbi,
    functionName: 'getHookFlags',
    args: [],
    chainId: getChainId(network),
    query: { enabled },
  })

  return { hookFlags }
}

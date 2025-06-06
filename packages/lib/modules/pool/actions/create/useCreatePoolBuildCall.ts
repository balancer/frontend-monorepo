import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { CreatePool, type CreatePoolInput } from '@balancer/sdk'
import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'

export function useCreatePoolBuildCall({
  createPoolInput,
  enabled,
}: {
  createPoolInput: CreatePoolInput
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()

  const createPool = new CreatePool()

  const queryFn = async (): Promise<TransactionConfig> => {
    const { callData, to } = createPool.buildCall(createPoolInput)
    return {
      chainId: createPoolInput.chainId,
      account: userAddress,
      data: callData,
      to,
    }
  }

  return useQuery({
    queryKey: ['create-pool-build-call'],
    queryFn,
    enabled: enabled && isConnected,
    gcTime: 0,
  })
}

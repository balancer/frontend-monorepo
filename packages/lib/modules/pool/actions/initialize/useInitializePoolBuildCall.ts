import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { InitPool, type InitPoolInputV3, type PoolType, InitPoolDataProvider } from '@balancer/sdk'
import { type Address } from 'viem'
import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { usePermit2Signature } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'

export function useInitializePoolBuildCall({
  rpcUrl,
  poolAddress,
  poolType,
  enabled,
  initPoolInput,
}: {
  initPoolInput: InitPoolInputV3
  rpcUrl: string
  poolAddress: Address
  poolType: PoolType
  enabled: boolean
}) {
  const { userAddress, isConnected } = useUserAccount()
  const protocolVersion = 3

  const { permit2Signature } = usePermit2Signature()
  const initPool = new InitPool()

  const queryFn = async (): Promise<TransactionConfig> => {
    if (!permit2Signature) {
      throw new Error('Permit2 signature is required but not available')
    }

    console.log('permit2Signature', permit2Signature)

    const initPoolDataProvider = new InitPoolDataProvider(initPoolInput.chainId, rpcUrl)
    const poolState = await initPoolDataProvider.getInitPoolData(
      poolAddress,
      poolType,
      protocolVersion
    )

    console.log('poolState', poolState)

    const { callData, to } = initPool.buildCallWithPermit2(
      initPoolInput,
      poolState,
      permit2Signature
    )

    console.log('callData', callData)
    console.log('to', to)

    return {
      chainId: initPoolInput.chainId,
      account: userAddress,
      data: callData,
      to,
    }
  }

  return useQuery({
    queryKey: ['initialize-pool-build-call'],
    queryFn,
    enabled: enabled && isConnected,
    gcTime: 0,
  })
}

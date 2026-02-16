import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { InitPool, type InitPoolInputV3, type PoolType, InitPoolDataProvider } from '@balancer/sdk'
import { type Address } from 'viem'
import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { usePermit2Signature } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { sentryMetaForInitializePoolHandler } from '@repo/lib/shared/utils/query-errors'
import { useBlockNumber } from 'wagmi'

type Params = {
  initPoolInput: InitPoolInputV3
  rpcUrl: string
  poolAddress: Address | undefined
  poolType: PoolType
  enabled: boolean
}

export function useInitializePoolBuildCall({
  rpcUrl,
  poolAddress,
  poolType,
  enabled,
  initPoolInput,
}: Params) {
  const { userAddress, isConnected } = useUserAccount()
  const { data: blockNumber } = useBlockNumber()
  const protocolVersion = 3

  const { permit2Signature } = usePermit2Signature()
  const initPool = new InitPool()

  const queryFn = async (): Promise<TransactionConfig> => {
    if (!poolAddress) throw new Error('missing pool address for init pool build call')

    const initPoolDataProvider = new InitPoolDataProvider(initPoolInput.chainId, rpcUrl)
    const poolState = await initPoolDataProvider.getInitPoolData(
      poolAddress,
      poolType,
      protocolVersion
    )

    let callData: `0x${string}`
    let to: Address
    let value: bigint

    if (permit2Signature) {
      const result = initPool.buildCallWithPermit2(initPoolInput, poolState, permit2Signature)
      callData = result.callData
      to = result.to
      value = result.value
    } else {
      const result = initPool.buildCall(initPoolInput, poolState)
      callData = result.callData
      to = result.to
      value = result.value
    }

    return {
      chainId: initPoolInput.chainId,
      account: userAddress,
      data: callData,
      to,
      value,
    }
  }

  return useQuery({
    queryKey: ['initialize-pool-build-call'],
    queryFn,
    enabled: enabled && isConnected,
    gcTime: 0,
    meta: sentryMetaForInitializePoolHandler('Error in initialize pool build call', {
      ...initPoolInput,
      blockNumber,
    }),
  })
}

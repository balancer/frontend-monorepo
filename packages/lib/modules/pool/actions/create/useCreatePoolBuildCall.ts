import { useQuery } from '@tanstack/react-query'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { CreatePool } from '@balancer/sdk'
import { CreatePoolInput } from './types'
import { type TransactionConfig } from '@repo/lib/modules/web3/contracts/contract.types'
import { getGqlChain, getNetworkConfig } from '@repo/lib/config/app.config'
import { encodeFunctionData, parseAbi } from 'viem'

type Props = {
  createPoolInput: CreatePoolInput
  enabled: boolean
}

export function useCreatePoolBuildCall({ createPoolInput, enabled }: Props) {
  const { userAddress, isConnected } = useUserAccount()

  const createPool = new CreatePool()

  const queryFn = async (): Promise<TransactionConfig> => {
    if (createPoolInput.protocolVersion === 3) {
      const { callData, to } = createPool.buildCall(createPoolInput)
      return {
        chainId: createPoolInput.chainId,
        account: userAddress,
        data: callData,
        to,
      }
    } else if (createPoolInput.protocolVersion === 1) {
      const { name, symbol } = createPoolInput
      const chain = getGqlChain(createPoolInput.chainId)
      const { contracts } = getNetworkConfig(chain)
      const to = contracts.balancer.bCoWFactory

      if (!to) throw new Error(`Missing bCoW factory address for ${chain}`)

      const data = encodeFunctionData({
        abi: parseAbi(['function newBPool(string name, string symbol)']),
        functionName: 'newBPool',
        args: [name, symbol],
      })

      return {
        chainId: createPoolInput.chainId,
        account: userAddress,
        data,
        to,
      }
    } else {
      throw new Error('Unsupported protocol version for create pool build call')
    }
  }

  return useQuery({
    queryKey: ['create-pool-build-call'],
    queryFn,
    enabled: enabled && isConnected,
    gcTime: 0,
  })
}

import { useQuery } from '@tanstack/react-query'
import { encodeFunctionData } from 'viem'
import type { Abi, Address, ContractFunctionName, AbiStateMutability } from 'viem'

export type TxConfig = {
  abi: Abi
  address: Address
  functionName: ContractFunctionName<any, AbiStateMutability>
  args?: any[]
  from: Address
  value?: bigint
  chainId: number
}

export function useTenderlyGasEstimate(txConfig?: TxConfig) {
  return useQuery({
    queryKey: ['tenderlyGas', txConfig],
    queryFn: async () => {
      if (!txConfig) throw new Error('txConfig is required')

      const data = encodeFunctionData({
        abi: txConfig.abi,
        functionName: txConfig.functionName,
        args: txConfig.args ?? [],
      })

      const response = await fetch('/api/tenderly/gas-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: txConfig.from,
          to: txConfig.address,
          input: data,
          value: txConfig.value?.toString() || '0',
          chainId: txConfig.chainId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to estimate gas')
      }

      const json = await response.json()
      return BigInt(json.gasUsed)
    },
    enabled: !!txConfig,
  })
}

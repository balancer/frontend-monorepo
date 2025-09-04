import { useQuery } from '@tanstack/react-query'
import { encodeFunctionData } from 'viem'
import type { Abi, Address, ContractFunctionName, AbiStateMutability } from 'viem'

const TENDERLY_ACCOUNT_SLUG = process.env.NEXT_PUBLIC_TENDERLY_ACCOUNT_SLUG!
const TENDERLY_PROJECT_SLUG = process.env.NEXT_PUBLIC_TENDERLY_PROJECT_SLUG!
const TENDERLY_ACCESS_KEY = process.env.NEXT_PUBLIC_TENDERLY_ACCESS_KEY!

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

      const response = await fetch(
        `https://api.tenderly.co/api/v1/account/${TENDERLY_ACCOUNT_SLUG}/project/${TENDERLY_PROJECT_SLUG}/simulate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Access-Key': TENDERLY_ACCESS_KEY,
          },
          body: JSON.stringify({
            from: txConfig.from,
            to: txConfig.address,
            input: data,
            value: txConfig.value,
            gas: 8000000,
            gas_price: 0,
            estimate_gas: true,
            simulation_type: 'quick',
            network_id: txConfig.chainId?.toString() || '1',
          }),
        }
      )

      const json = await response.json()
      return BigInt(json.transaction.gas_used)
    },
    enabled: !!txConfig,
  })
}

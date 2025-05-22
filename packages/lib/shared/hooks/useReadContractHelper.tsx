// this helper is used to avoid wagmi provider issues that occur when using useReadContract directly from wagmi in the apps

import { Abi, ContractFunctionName, ContractFunctionArgs, ContractFunctionReturnType } from 'viem'
import { useReadContract as useReadContractWagmi } from 'wagmi'

// Helper type: Extract only "pure" or "view" function names
type ReadOnlyFunctionNames<TAbi extends Abi> = {
  [K in ContractFunctionName<TAbi>]: TAbi extends readonly (infer F)[]
    ? F extends { name: K; stateMutability: infer M }
      ? M extends 'view' | 'pure'
        ? K
        : never
      : never
    : never
}[ContractFunctionName<TAbi>]

export function useReadContract<
  const TAbi extends Abi,
  TFunctionName extends ReadOnlyFunctionNames<TAbi>,
>(params: {
  abi: TAbi
  address: `0x${string}` | undefined
  functionName: TFunctionName
  args?: ContractFunctionArgs<TAbi, TFunctionName>
  chainId?: number
  query?: {
    enabled?: boolean
  }
}) {
  // Cast to any to avoid TS overload issues in wagmi
  const result = useReadContractWagmi(params as any)

  return {
    ...result,
    data: result.data as ContractFunctionReturnType<TAbi, TFunctionName> | undefined,
  }
}

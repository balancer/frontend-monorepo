import { useReadContract as useWagmiReadContract, UseReadContractParameters } from 'wagmi'
import type { Abi } from 'abitype'
import type { ContractFunctionName } from 'viem'

export function useReadContract<
  TAbi extends Abi,
  TFunctionName extends ContractFunctionName<TAbi, 'pure' | 'view'>,
>(params: UseReadContractParameters<TAbi, TFunctionName>) {
  return useWagmiReadContract(params)
}

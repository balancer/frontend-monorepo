import {
  UseWaitForTransactionReceiptReturnType,
  useEstimateGas,
  useSendTransaction,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { Abi, Address, erc20Abi } from 'viem'
import { SupportedChainId } from '@/lib/config/config.types'

export type TransactionSimulation = (
  | ReturnType<typeof useSimulateContract>
  | ReturnType<typeof useEstimateGas>
) & { variables: { chainId: SupportedChainId } }

export type TransactionExecution =
  | ReturnType<typeof useWriteContract>
  | ReturnType<typeof useSendTransaction>
export type TransactionResult = UseWaitForTransactionReceiptReturnType
export type TransactionBundle = {
  chainId: SupportedChainId
  simulation: TransactionSimulation
  execution: TransactionExecution
  result: TransactionResult
}

export type AbiItem = Abi[number]
export type WriteAbiMutability = 'payable' | 'nonpayable'
export type ReadAbiMutability = 'view'

export type TransactionConfig = {
  account: Address
  chainId: SupportedChainId
  data: Address
  to: Address
  value?: bigint
}

export type Erc20Abi = typeof erc20Abi

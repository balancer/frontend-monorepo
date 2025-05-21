'use client'

import { getGqlChain } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { Abi, Address, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useChainSwitch } from '../useChainSwitch'
import { AbiMap } from './AbiMap'
import { TransactionExecution, TransactionSimulation, WriteAbiMutability } from './contract.types'
import { useOnTransactionConfirmation } from './useOnTransactionConfirmation'
import { useOnTransactionSubmission } from './useOnTransactionSubmission'
import { captureWagmiExecutionError } from '@repo/lib/shared/utils/query-errors'
import { useTxHash } from '../safe.hooks'
import { getWaitForReceiptTimeout } from './wagmi-helpers'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { useMockedTxHash } from '@repo/lib/modules/web3/contracts/useMockedTxHash'

/**
 * Allows to skip transaction confirmation step in the wallet and go directly to success state
 * Mostly used for testing cross-chain sync
 */
const allowSkipTransaction = false

type IAbiMap = typeof AbiMap
type AbiMapKey = keyof typeof AbiMap

export interface ManagedTransactionInput {
  contractAddress: string
  contractId: AbiMapKey
  functionName: ContractFunctionName<IAbiMap[AbiMapKey], WriteAbiMutability>
  labels: TransactionLabels
  chainId: SupportedChainId
  args?: ContractFunctionArgs<IAbiMap[AbiMapKey], WriteAbiMutability> | null
  txSimulationMeta?: Record<string, unknown>
  enabled: boolean
  value?: bigint
  onTransactionChange?: (transaction: ManagedResult) => void
}

export function useManagedTransaction({
  contractAddress,
  contractId,
  functionName,
  labels,
  chainId,
  args,
  txSimulationMeta,
  enabled = true,
  value,
}: ManagedTransactionInput) {
  const { minConfirmations } = useNetworkConfig()
  const { shouldChangeNetwork } = useChainSwitch(chainId)

  const simulateQuery = useSimulateContract({
    abi: AbiMap[contractId] as Abi,
    address: contractAddress as Address,
    functionName: functionName as ContractFunctionName<any, WriteAbiMutability>,
    // This any is 'safe'. The type provided to any is the same type for args that is inferred via the functionName
    args: args as any,
    chainId,
    query: {
      enabled: enabled && !shouldChangeNetwork,
      meta: txSimulationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
    value,
  })

  const { mockedTxHash, setMockedTxHash } = useMockedTxHash()

  const writeQuery = useWriteContract()

  const { txHash, isSafeTxLoading } = useTxHash({
    chainId,
    wagmiTxHash: mockedTxHash ?? writeQuery.data,
  })

  const transactionStatusQuery = useWaitForTransactionReceipt({
    chainId,
    hash: txHash,
    confirmations: minConfirmations,
    timeout: getWaitForReceiptTimeout(chainId),
  })

  const bundle = {
    chainId,
    simulation: simulateQuery as TransactionSimulation,
    execution: writeQuery as TransactionExecution,
    result: transactionStatusQuery,
    isSafeTxLoading,
  }

  // on successful submission to chain, add tx to cache
  useOnTransactionSubmission({
    labels,
    hash: txHash,
    chain: getGqlChain(chainId as SupportedChainId),
  })

  // on confirmation, update tx in tx cache
  useOnTransactionConfirmation({
    labels,
    status: bundle.result.data?.status,
    hash: bundle.result.data?.transactionHash,
  })

  const managedWriteAsync = async () => {
    if (!simulateQuery.data) return

    if (allowSkipTransaction) {
      const txHash = setMockedTxHash()
      if (txHash) return
    }

    try {
      return await writeQuery.writeContractAsync({
        ...simulateQuery.data.request,
        chainId: chainId,
      })
    } catch (e: unknown) {
      captureWagmiExecutionError(e, 'Error in managed transaction execution', {
        chainId,
        request: simulateQuery.data.request,
      })
      throw e
    }
  }

  return {
    ...bundle,
    executeAsync: managedWriteAsync,
  } satisfies ManagedResult
}

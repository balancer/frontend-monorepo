'use client'

import { getGqlChain } from '@repo/lib/config/app.config'
import { SupportedChainId } from '@repo/lib/config/config.types'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import {
  ManagedResult,
  TransactionLabels,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { isSameAddress } from '@repo/lib/shared/utils/addresses'
import { captureWagmiExecutionError } from '@repo/lib/shared/utils/query-errors'
import { useEffect, useState } from 'react'
import { Address, ContractFunctionArgs, ContractFunctionName } from 'viem'
import { useSimulateContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { useTxHash } from '../safe.hooks'
import { useChainSwitch } from '../useChainSwitch'
import { usdtAbi } from './abi/UsdtAbi'
import { TransactionExecution, TransactionSimulation, WriteAbiMutability } from './contract.types'
import { useOnTransactionConfirmation } from './useOnTransactionConfirmation'
import { useOnTransactionSubmission } from './useOnTransactionSubmission'
import { getWaitForReceiptTimeout } from './wagmi-helpers'
import { onlyExplicitRefetch } from '@repo/lib/shared/utils/queries'
import { erc20AbiWithIncreaseApproval } from '@repo/lib/modules/web3/contracts/abi/vebalAbi'

type Erc20AbiWithIncreaseApproval = typeof erc20AbiWithIncreaseApproval

export interface ManagedErc20TransactionInput {
  tokenAddress: Address
  functionName:
    | ContractFunctionName<Erc20AbiWithIncreaseApproval, WriteAbiMutability>
    | 'increaseApproval' // Edge-case for veBalBpt approval
  labels: TransactionLabels
  isComplete?: () => boolean
  onTransactionChange: (transaction: ManagedResult) => void
  chainId: SupportedChainId
  args?: ContractFunctionArgs<Erc20AbiWithIncreaseApproval, WriteAbiMutability> | null
  enabled: boolean
  simulationMeta: Record<string, unknown>
}

export function useManagedErc20Transaction({
  tokenAddress,
  functionName,
  labels,
  chainId,
  args,
  enabled = true,
  simulationMeta,
}: ManagedErc20TransactionInput) {
  const [writeArgs, setWriteArgs] = useState(args)
  const { minConfirmations } = useNetworkConfig()
  const { shouldChangeNetwork } = useChainSwitch(chainId)

  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const isUsdt = isSameAddress(tokenAddress, usdtAddress)

  const simulateQuery = useSimulateContract({
    /*
      USDTs ABI does not exactly follow the erc20ABI so we need its explicit ABI to avoid errors (e.g. calling approve)
      More info: https://github.com/wevm/wagmi/issues/2749#issuecomment-1638200817
    */
    abi: isUsdt ? usdtAbi : erc20AbiWithIncreaseApproval,
    address: tokenAddress,
    functionName: functionName as ContractFunctionName<any, WriteAbiMutability>,
    // This any is 'safe'. The type provided to any is the same type for args that is inferred via the functionName
    args: writeArgs as any,
    chainId,
    query: {
      enabled: enabled && !shouldChangeNetwork,
      meta: simulationMeta,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
  })

  const writeQuery = useWriteContract()

  const { txHash, isSafeTxLoading } = useTxHash({
    chainId,
    wagmiTxHash: writeQuery.data,
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
    chain: getGqlChain(chainId),
  })

  // on confirmation, update tx in tx cache
  useOnTransactionConfirmation({
    labels,
    status: bundle.result.data?.status,
    hash: bundle.result.data?.transactionHash,
  })

  // if parent changes args, update here
  useEffect(() => {
    setWriteArgs(args)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(args)])

  const managedWriteAsync = async (
    args?: ContractFunctionArgs<Erc20AbiWithIncreaseApproval, WriteAbiMutability>
  ) => {
    if (args) {
      setWriteArgs(args)
    }
    if (!simulateQuery.data) return

    try {
      return await writeQuery.writeContractAsync(simulateQuery.data.request)
    } catch (e: unknown) {
      captureWagmiExecutionError(e, 'Error in ERC20 transaction execution', {
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

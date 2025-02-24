/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useSignPermitStep } from '@repo/lib/modules/transactions/transaction-steps/useSignPermitStep'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { isV3Pool } from '../../pool.helpers'
import { shouldUseRecoveryRemoveLiquidity } from '../LiquidityActionHelpers'
import { SdkQueryRemoveLiquidityOutput } from './remove-liquidity.types'
import { RemoveLiquidityStepParams, useRemoveLiquidityStep } from './useRemoveLiquidityStep'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { RawAmount } from '@repo/lib/modules/tokens/approvals/approval-rules'
import { Address } from 'viem'
import { RemoveLiquiditySimulationQueryResult } from './queries/useRemoveLiquiditySimulationQuery'
import { useIsSafeAccount, useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { Pool } from '../../pool.types'
import { NestedProportionalQueryRemoveLiquidityOutput } from './handlers/NestedProportionalRemoveLiquidity.handler'
import { useWalletConnectMetadata } from '@repo/lib/modules/web3/wallet-connect/useWalletConnectMetadata'

export function useRemoveLiquiditySteps(params: RemoveLiquidityStepParams): TransactionStep[] {
  const { chainId, pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { slippage } = useUserSettings()
  const relayerMode = useRelayerMode(pool)
  const { shouldUseSignatures } = useUserSettings()
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const signRelayerStep = useSignRelayerStep(chain)
  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)

  const { wethIsEth, simulationQuery } = params
  // Only used to sign permit for v3 pools (standard permit is supported by all BPTs by contract)
  const signPermitStep = useSignPermitStep({
    pool,
    wethIsEth,
    slippagePercent: slippage,
    queryOutput: simulationQuery.data as SdkQueryRemoveLiquidityOutput,
  })

  const { isSafeAccountViaWalletConnect } = useWalletConnectMetadata()

  // Only used for v3 pools + Safe account scenario
  // Standard permit signatures are not supported by Safe accounts (signer != owner) so we use an Approval BPT Tx step instead
  const { isLoadingTokenApprovalSteps, tokenApprovalSteps } = useBptTokenApprovals(
    pool,
    simulationQuery
  )

  const removeLiquidityStep = useRemoveLiquidityStep(params)
  removeLiquidityStep.nestedSteps = tokenApprovalSteps

  // TODO: should we extract this to a tested hook useGetRemoveLiquiditySteps(params)?
  function getRemoveLiquiditySteps(): TransactionStep[] {
    if (isV3Pool(pool)) {
      if (isSafeAccountViaWalletConnect || !shouldUseSignatures) {
        return [...tokenApprovalSteps, removeLiquidityStep]
      }
      if (shouldBatchTransactions) {
        // tokenApprovalSteps are hidden for Safe accounts (will be included in the tx batch)
        return [removeLiquidityStep]
      }
      // Standard Permit signature
      return [signPermitStep, removeLiquidityStep]
    }
    // V2 and V1 (CoW AMM) pools use the Vault relayer so they do not require permit signatures
    return [removeLiquidityStep]
  }

  const removeLiquiditySteps = getRemoveLiquiditySteps()

  return useMemo(() => {
    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, ...removeLiquiditySteps]
    } else if (shouldSignRelayerApproval && !shouldUseRecoveryRemoveLiquidity(pool)) {
      return [signRelayerStep, ...removeLiquiditySteps]
    }

    return removeLiquiditySteps
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    removeLiquiditySteps,
    approveRelayerStep,
    signRelayerStep,
    signPermitStep,
    isLoadingRelayerApproval,
    isLoadingTokenApprovalSteps,
  ])
}

function useBptTokenApprovals(
  pool: Pool,
  simulationQuery: RemoveLiquiditySimulationQueryResult
): { isLoadingTokenApprovalSteps: boolean; tokenApprovalSteps: TransactionStep[] } {
  const isSafeAccount = useIsSafeAccount()
  const { spenderAddress, rawAmount } = getSimulationQueryData(simulationQuery)

  const bptAmount: RawAmount = {
    rawAmount,
    address: pool.address as Address,
    symbol: pool.symbol,
  }
  //Only used for v3 pools + Safe account scenario
  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress,
      chain: pool.chain,
      approvalAmounts: [bptAmount],
      actionType: 'RemoveLiquidity',
      enabled: isSafeAccount,
    })

  return { isLoadingTokenApprovalSteps, tokenApprovalSteps }
}

function getSimulationQueryData(simulationQuery: RemoveLiquiditySimulationQueryResult): {
  rawAmount: bigint
  spenderAddress: Address
} {
  // Return default values if simulation query is not loaded
  if (!simulationQuery.data) return { rawAmount: 0n, spenderAddress: '' as Address }
  // TODO: Create a common interface for  all possible types (like NestedProportionalQueryRemoveLiquidityOutput)
  const simulationData = simulationQuery.data as
    | SdkQueryRemoveLiquidityOutput
    | NestedProportionalQueryRemoveLiquidityOutput

  const rawAmount = getRawAmount(simulationData)

  const spenderAddress = simulationData?.sdkQueryOutput.to
  return { rawAmount, spenderAddress }
}

function getRawAmount(
  simulationData: SdkQueryRemoveLiquidityOutput | NestedProportionalQueryRemoveLiquidityOutput
) {
  if (isSdkQueryRemoveLiquidityOutput(simulationData)) {
    return simulationData.sdkQueryOutput.bptIn.amount
  }
  if (isNestedProportionalQueryRemoveLiquidityOutput(simulationData)) {
    return simulationData.sdkQueryOutput.bptAmountIn.amount
  }
  throw new Error(`Invalid simulation data: ${simulationData}`)
}

function isSdkQueryRemoveLiquidityOutput(data: any): data is SdkQueryRemoveLiquidityOutput {
  return data && data.sdkQueryOutput.bptIn !== undefined
}

function isNestedProportionalQueryRemoveLiquidityOutput(
  data: any
): data is NestedProportionalQueryRemoveLiquidityOutput {
  return data && data.sdkQueryOutput.bptAmountIn !== undefined
}

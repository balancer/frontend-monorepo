/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useSignPermitStep } from '@repo/lib/modules/transactions/transaction-steps/useSignPermitStep'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useIsSafeAccount, useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { isV3Pool } from '../../pool.helpers'
import { Pool } from '../../pool.types'
import { shouldUseRecoveryRemoveLiquidity } from '../LiquidityActionHelpers'
import { SdkQueryRemoveLiquidityOutput } from './remove-liquidity.types'
import { RemoveLiquidityStepParams, useRemoveLiquidityStep } from './useRemoveLiquidityStep'
import { useBptTokenApprovals } from './useBptTokenApprovals'

export function useRemoveLiquiditySteps(params: RemoveLiquidityStepParams): TransactionStep[] {
  const { chainId, pool, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { slippage } = useUserSettings()
  const relayerMode = useRelayerMode(pool)
  const { shouldUseSignatures } = useUserSettings()
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const signRelayerStep = useSignRelayerStep(chain)
  const isSafeAccount = useIsSafeAccount()
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

  // Only used for v3 pools + Safe account scenario
  // Standard permit signatures are not supported by Safe accounts (signer != owner) so we use an Approval BPT Tx step instead
  const { isLoadingTokenApprovalSteps, tokenApprovalSteps } = useBptTokenApprovals(
    pool,
    simulationQuery
  )

  const removeLiquidityStep = useRemoveLiquidityStep(params)

  const removeLiquiditySteps = getApprovalAndRemoveSteps({
    pool,
    shouldUseSignatures,
    isSafeAccount,
    shouldBatchTransactions,
    tokenApprovalSteps,
    signPermitStep,
    removeLiquidityStep,
  })

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

export function getApprovalAndRemoveSteps({
  pool,
  shouldUseSignatures,
  isSafeAccount,
  shouldBatchTransactions,
  tokenApprovalSteps,
  signPermitStep,
  removeLiquidityStep,
}: {
  pool: Pool
  shouldUseSignatures: boolean
  isSafeAccount: boolean
  shouldBatchTransactions: boolean
  tokenApprovalSteps: TransactionStep[]
  signPermitStep: TransactionStep
  removeLiquidityStep: TransactionStep
}) {
  removeLiquidityStep.nestedSteps = tokenApprovalSteps
  if (isV3Pool(pool)) {
    /*
      Standard permit signatures are not supported by all Safe scenarios (such as Safe + WC where signer != owner).
      So when isSafeAccount we always use the disabled signatures alternative flow (using tokenApprovalSteps)
     */
    if (!shouldUseSignatures || isSafeAccount) {
      if (shouldBatchTransactions) {
        // tokenApprovalSteps are hidden for Safe accounts (will be included in the tx batch)
        return [removeLiquidityStep]
      }
      return [...tokenApprovalSteps, removeLiquidityStep]
    }

    // Standard Permit signature
    return [signPermitStep, removeLiquidityStep]
  }
  // V2 and V1 (CoW AMM) pools use the Vault relayer so they do not require permit signatures
  return [removeLiquidityStep]
}

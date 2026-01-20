import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useHasApprovedRelayer } from '@repo/lib/modules/relayer/useHasApprovedRelayer'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { ReliquaryDepositStepParams, useReliquaryDepositStep } from './useReliquaryDepositStep'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useHasApprovedRelayerForAllRelics } from './useHasApprovedRelayerForAllRelics'
import { getChainId } from '@repo/lib/config/app.config'
import { useReliquary } from '../ReliquaryProvider'

export type ReliquaryDepositStepsParams = ReliquaryDepositStepParams & {
  helpers: LiquidityActionHelpers
}

export function useReliquaryDepositSteps({
  helpers,
  handler,
  humanAmountsIn,
  simulationQuery,
  slippage,
  createNew,
  relicId,
}: ReliquaryDepositStepsParams) {
  const { pool } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const { chain } = useReliquary()

  const chainId = getChainId(chain)

  // always use gas txn for approval
  const reliquaryRelayerMode = 'approveRelayer'

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } = useApproveRelayerStep(
    chainId,
    { relayerMode: reliquaryRelayerMode }
  )

  const { hasApprovedRelayer } = useHasApprovedRelayer(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  // Reliquary NFT approval
  const { step: approveRelayerRelicsStep, isLoading: isLoadingRelayerRelicsApproval } =
    useApproveRelayerRelicsStep()
  const { hasApprovedRelayerForAllRelics } = useHasApprovedRelayerForAllRelics()

  // Token approvals (V2 only - no permit2)
  const inputAmounts = useMemo(
    () => helpers.toInputAmounts(humanAmountsIn),
    [humanAmountsIn, helpers]
  )

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForAddLiquidity(pool),
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      isPermit2: false, // V2 pools don't use permit2
    })

  // Reliquary deposit steps (multicall: joinPool + depositIntoReliquary)
  const { multicallStep } = useReliquaryDepositStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
    createNew,
    relicId,
  })

  const allSteps = useMemo<TransactionStep[]>(() => {
    // 1. Get token approval + add liquidity steps
    let steps = getApprovalAndAddSteps({
      isPermit2: false,
      shouldUseSignatures: false, // V2 doesn't use permit2 signatures
      shouldBatchTransactions,
      permit2ApprovalSteps: [],
      tokenApprovalSteps,
      addLiquidityStep: multicallStep,
    })

    steps = [approveRelayerRelicsStep, approveRelayerStep, ...steps]

    return steps
  }, [
    shouldBatchTransactions,
    tokenApprovalSteps,
    multicallStep,
    createNew,
    relicId,
    hasApprovedRelayerForAllRelics,
    approveRelayerRelicsStep,
    hasApprovedRelayer,
    approveRelayerStep,
  ])

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps || isLoadingRelayerApproval || isLoadingRelayerRelicsApproval,
    steps: allSteps,
  }
}

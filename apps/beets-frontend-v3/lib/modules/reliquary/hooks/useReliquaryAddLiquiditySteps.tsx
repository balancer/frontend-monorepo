import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/transactions/transaction-steps/tx-batch.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import {
  ReliquaryAddLiquidityStepParams,
  useReliquaryAddLiquidityStep,
} from './useReliquaryAddLiquidityStep'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { getChainId } from '@repo/lib/config/app.config'
import { useReliquary } from '../ReliquaryProvider'

export type ReliquaryAddLiquidityStepsParams = ReliquaryAddLiquidityStepParams & {
  helpers: LiquidityActionHelpers
}

export function useReliquaryAddLiquiditySteps({
  helpers,
  handler,
  humanAmountsIn,
  simulationQuery,
  slippage,
  createNew,
  relicId,
}: ReliquaryAddLiquidityStepsParams) {
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

  // Reliquary NFT approval
  const { step: approveRelayerRelicsStep, isLoading: isLoadingRelayerRelicsApproval } =
    useApproveRelayerRelicsStep()

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

  // Reliquary add liquidity steps (multicall: joinPool + add liquidity into Reliquary)
  const { multicallStep } = useReliquaryAddLiquidityStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
    createNew,
    relicId,
  })

  const allSteps = useMemo<TransactionStep[]>(
    () =>
      getReliquaryAddLiquiditySteps({
        shouldBatchTransactions,
        tokenApprovalSteps,
        multicallStep,
        approveRelayerRelicsStep,
        approveRelayerStep,
      }),
    [
      shouldBatchTransactions,
      tokenApprovalSteps,
      multicallStep,
      approveRelayerRelicsStep,
      approveRelayerStep,
    ]
  )

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps || isLoadingRelayerApproval || isLoadingRelayerRelicsApproval,
    steps: allSteps,
  }
}

/*
  Composes the reliquary add-liquidity step list. When batching, the relayer
  approvals (relayer + relayer-for-relics) are appended to the nested steps of the
  multicall (createRelic + joinPool + add liquidity) so the whole flow runs as one
  atomic batch; otherwise they are shown as separate steps ahead of the multicall.
*/
export function getReliquaryAddLiquiditySteps({
  shouldBatchTransactions,
  tokenApprovalSteps,
  multicallStep,
  approveRelayerRelicsStep,
  approveRelayerStep,
}: {
  shouldBatchTransactions: boolean
  tokenApprovalSteps: TransactionStep[]
  multicallStep: TransactionStep
  approveRelayerRelicsStep: TransactionStep
  approveRelayerStep: TransactionStep
}): TransactionStep[] {
  const steps = getApprovalAndAddSteps({
    isPermit2: false,
    shouldUseSignatures: false, // V2 doesn't use permit2 signatures
    shouldBatchTransactions,
    permit2ApprovalSteps: [],
    tokenApprovalSteps,
    addLiquidityStep: multicallStep,
  })

  if (shouldBatchTransactions) {
    // The relayer approvals are executed inside the same atomic batch as the token
    // approvals and the multicall, so they are hidden from the step list too.
    // setRelayerApproval runs first, then setApprovalForAll, then the token
    // approvals, all before the multicall (createRelic + joinPool + add liquidity)
    multicallStep.nestedSteps = [
      approveRelayerStep,
      approveRelayerRelicsStep,
      ...(multicallStep.nestedSteps ?? []),
    ]

    return [multicallStep]
  }

  return [approveRelayerStep, approveRelayerRelicsStep, ...steps]
}

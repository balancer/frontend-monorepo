/* eslint-disable react-hooks/preserve-manual-memoization */
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { isBoosted, requiresPermit2Approval } from '@repo/lib/modules/pool/pool.helpers'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { useSignPermit2AddStep } from '@repo/lib/modules/pool/actions/add-liquidity/useSignPermit2AddStep'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePermit2ApprovalSteps } from '@repo/lib/modules/tokens/approvals/permit2/usePermit2ApprovalSteps'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { ReliquaryDepositStepParams, useReliquaryDepositStep } from './useReliquaryDepositStep'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'

type ReliquaryDepositStepsParams = ReliquaryDepositStepParams & {
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
  const { pool, chainId, chain } = usePool()
  const shouldBatchTransactions = useShouldBatchTransactions()
  const relayerMode = useRelayerMode(pool)
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const { shouldUseSignatures } = useUserSettings()

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } = useApproveRelayerStep(
    chainId,
    { relayerMode }
  )

  const signRelayerStep = useSignRelayerStep(chain)

  const inputAmounts = useMemo(
    () => helpers.toInputAmounts(humanAmountsIn),
    [humanAmountsIn, helpers]
  )

  const isPermit2 = requiresPermit2Approval(pool)

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForAddLiquidity(pool),
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      isPermit2,
    })

  const wethIsEth = helpers.isNativeAssetIn(humanAmountsIn)

  const signPermit2Step = useSignPermit2AddStep({
    wethIsEth,
    humanAmountsIn,
    simulationQuery,
  })

  const networkConfig = getNetworkConfig(chain)
  const { steps: permit2ApprovalSteps, isLoading: isLoadingPermit2ApprovalSteps } =
    usePermit2ApprovalSteps({
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      enabled: isPermit2 && !shouldUseSignatures,
      router: isBoosted(pool)
        ? networkConfig.contracts.balancer.compositeLiquidityRouterBoosted
        : networkConfig.contracts.balancer.router,
    })

  const isSignPermit2Loading = isPermit2 && !signPermit2Step

  // Use custom reliquary deposit steps (returns both pool liquidity and relic deposit steps)
  const { addLiquidityStep, depositIntoRelicStep } = useReliquaryDepositStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
    createNew,
    relicId,
  })

  // Get approval steps with the first step (add liquidity to pool)
  const approveAndAddSteps = getApprovalAndAddSteps({
    isPermit2,
    shouldUseSignatures,
    shouldBatchTransactions,
    permit2ApprovalSteps,
    tokenApprovalSteps,
    signPermit2Step,
    addLiquidityStep, // This step executes the multicall transaction
  })

  // Add the second step (deposit into relic) after the add liquidity step
  const allSteps = useMemo<TransactionStep[]>(() => {
    // Insert deposit into relic step after add liquidity step
    const stepsWithRelicDeposit = [...approveAndAddSteps, depositIntoRelicStep]

    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, ...stepsWithRelicDeposit]
    } else if (shouldSignRelayerApproval) {
      return [signRelayerStep, ...stepsWithRelicDeposit]
    }

    return stepsWithRelicDeposit
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    tokenApprovalSteps,
    addLiquidityStep,
    depositIntoRelicStep,
    approveRelayerStep,
    signRelayerStep,
    signPermit2Step,
    humanAmountsIn,
  ])

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps ||
      isLoadingRelayerApproval ||
      isLoadingPermit2ApprovalSteps ||
      isSignPermit2Loading,
    steps: allSteps,
  }
}

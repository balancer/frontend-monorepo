/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@repo/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { requiresPermit2Approval } from '../../pool.helpers'
import { LiquidityActionHelpers } from '../LiquidityActionHelpers'
import { AddLiquidityStepParams, useAddLiquidityStep } from './useAddLiquidityStep'
import { useSignPermit2AddStep } from './useSignPermit2AddStep'

type AddLiquidityStepsParams = AddLiquidityStepParams & {
  helpers: LiquidityActionHelpers
}
export function useAddLiquiditySteps({
  helpers,
  handler,
  humanAmountsIn,
  simulationQuery,
}: AddLiquidityStepsParams) {
  const { pool, chainId, chain } = usePool()
  const { slippage } = useUserSettings()
  const relayerMode = useRelayerMode(pool)
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)

  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)
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

  const isSignPermit2Loading = isPermit2 && !signPermit2Step

  const addLiquidityStep = useAddLiquidityStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
  })

  const addSteps =
    isPermit2 && signPermit2Step ? [signPermit2Step, addLiquidityStep] : [addLiquidityStep]

  const steps = useMemo(() => {
    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, ...tokenApprovalSteps, ...addSteps]
    } else if (shouldSignRelayerApproval) {
      return [signRelayerStep, ...tokenApprovalSteps, ...addSteps]
    }

    return [...tokenApprovalSteps, ...addSteps]
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    tokenApprovalSteps,
    addLiquidityStep,
    approveRelayerStep,
    signRelayerStep,
    signPermit2Step,
    humanAmountsIn,
  ])

  return {
    isLoadingSteps: isLoadingTokenApprovalSteps || isLoadingRelayerApproval || isSignPermit2Loading,
    steps,
  }
}

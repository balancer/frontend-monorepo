/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@/lib/modules/relayer/useRelayerMode'
import { useTokenApprovalSteps } from '@/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@/lib/modules/tokens/token.helpers'
import { useSignPermit2Step } from '@/lib/modules/transactions/transaction-steps/useSignPermit2Step'
import { useSignRelayerStep } from '@/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { requiresPermit2Approval } from '../../pool.helpers'
import { LiquidityActionHelpers } from '../LiquidityActionHelpers'
import { SdkQueryAddLiquidityOutput } from './add-liquidity.types'
import { AddLiquidityStepParams, useAddLiquidityStep } from './useAddLiquidityStep'

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

  const signPermit2Step = useSignPermit2Step({
    pool,
    humanAmountsIn,
    slippagePercent: slippage,
    queryOutput: simulationQuery.data as SdkQueryAddLiquidityOutput,
    isPermit2,
    wethIsEth: helpers.isNativeAssetIn(humanAmountsIn),
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

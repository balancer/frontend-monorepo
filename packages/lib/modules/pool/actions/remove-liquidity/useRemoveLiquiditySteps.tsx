/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { shouldUseRecoveryRemoveLiquidity } from '../LiquidityActionHelpers'
import { RemoveLiquidityStepParams, useRemoveLiquidityStep } from './useRemoveLiquidityStep'
import { useShouldSignRelayerApproval } from '../../../relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '../../../relayer/useApproveRelayerStep'
import { useRelayerMode } from '../../../relayer/useRelayerMode'
import { TransactionStep } from '../../../transactions/transaction-steps/lib'
import { useSignRelayerStep } from '../../../transactions/transaction-steps/useSignRelayerStep'

export function useRemoveLiquiditySteps(params: RemoveLiquidityStepParams): TransactionStep[] {
  const { chainId, pool, chain } = usePool()
  const relayerMode = useRelayerMode(pool)
  const shouldSignRelayerApproval = useShouldSignRelayerApproval(chainId, relayerMode)
  const signRelayerStep = useSignRelayerStep(chain)
  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } =
    useApproveRelayerStep(chainId)

  const removeLiquidityStep = useRemoveLiquidityStep(params)

  return useMemo(() => {
    if (relayerMode === 'approveRelayer') {
      return [approveRelayerStep, removeLiquidityStep]
    } else if (shouldSignRelayerApproval && !shouldUseRecoveryRemoveLiquidity(pool)) {
      return [signRelayerStep, removeLiquidityStep]
    }

    return [removeLiquidityStep]
  }, [
    relayerMode,
    shouldSignRelayerApproval,
    removeLiquidityStep,
    approveRelayerStep,
    signRelayerStep,
    isLoadingRelayerApproval,
  ])
}

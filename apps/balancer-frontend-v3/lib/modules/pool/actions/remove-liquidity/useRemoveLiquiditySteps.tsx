/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@/lib/modules/relayer/useRelayerMode'
import { TransactionStep } from '@/lib/modules/transactions/transaction-steps/lib'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { shouldUseRecoveryRemoveLiquidity } from '../LiquidityActionHelpers'
import { RemoveLiquidityStepParams, useRemoveLiquidityStep } from './useRemoveLiquidityStep'
import { useSignRelayerStep } from '@/lib/modules/transactions/transaction-steps/useSignRelayerStep'

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

/* eslint-disable react-hooks/exhaustive-deps */
import { useShouldSignRelayerApproval } from '@/lib/modules/relayer/signRelayerApproval.hooks'
import { useApproveRelayerStep } from '@/lib/modules/relayer/useApproveRelayerStep'
import { useRelayerMode } from '@/lib/modules/relayer/useRelayerMode'
import { TransactionStep } from '@/lib/modules/transactions/transaction-steps/lib'
import { useSignPermitStep } from '@/lib/modules/transactions/transaction-steps/useSignPermitStep'
import { useSignRelayerStep } from '@/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useUserSettings } from '@/lib/modules/user/settings/UserSettingsProvider'
import { useMemo } from 'react'
import { usePool } from '../../PoolProvider'
import { isV3Pool } from '../../pool.helpers'
import { shouldUseRecoveryRemoveLiquidity } from '../LiquidityActionHelpers'
import { SdkQueryRemoveLiquidityOutput } from './remove-liquidity.types'
import { RemoveLiquidityStepParams, useRemoveLiquidityStep } from './useRemoveLiquidityStep'

export function useRemoveLiquiditySteps(params: RemoveLiquidityStepParams): TransactionStep[] {
  const { chainId, pool, chain } = usePool()
  const { slippage } = useUserSettings()
  const relayerMode = useRelayerMode(pool)
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

  const removeLiquidityStep = useRemoveLiquidityStep(params)

  const removeLiquiditySteps = isV3Pool(pool)
    ? // Standard Permit signature
      [signPermitStep, removeLiquidityStep]
    : // V2 and V1 (CoW AMM) pools use the Vault relayer so they do not require permit signatures
      [removeLiquidityStep]

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
  ])
}

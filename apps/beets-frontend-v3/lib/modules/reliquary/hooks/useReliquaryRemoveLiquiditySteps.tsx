import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useReliquaryRemoveLiquidityStep } from './useReliquaryRemoveLiquidityStep'
import { RemoveLiquidityHandler } from '@repo/lib/modules/pool/actions/remove-liquidity/handlers/RemoveLiquidity.handler'
import { Address } from 'viem'

type UseReliquaryRemoveLiquidityStepsParams = {
  handler: RemoveLiquidityHandler
  simulationQuery: any
  relicId: number
  singleTokenOutAddress?: Address
}

export function useReliquaryRemoveLiquiditySteps({
  handler,
  simulationQuery,
  relicId,
  singleTokenOutAddress,
}: UseReliquaryRemoveLiquidityStepsParams): TransactionStep[] {
  const { chainId } = usePool()
  const { slippage } = useUserSettings()

  const reliquaryRelayerMode = 'approveRelayer'

  const { step: approveRelayerStep } = useApproveRelayerStep(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  const { step: approveRelayerRelicsStep } = useApproveRelayerRelicsStep()

  // Get the multicall remove liquidity step
  const { multicallStep } = useReliquaryRemoveLiquidityStep({
    handler,
    simulationQuery,
    slippage,
    relicId,
    singleTokenOutAddress,
  })

  return [approveRelayerRelicsStep, approveRelayerStep, multicallStep]
}

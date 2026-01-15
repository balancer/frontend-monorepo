import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useReliquaryWithdrawStep } from './useReliquaryWithdrawStep'

type UseReliquaryWithdrawStepsParams = {
  handler: any
  simulationQuery: any
  relicId?: number
}

export function useReliquaryWithdrawSteps({
  handler,
  simulationQuery,
  relicId,
}: UseReliquaryWithdrawStepsParams): TransactionStep[] {
  const { chainId } = usePool()
  const { slippage } = useUserSettings()

  const reliquaryRelayerMode = 'approveRelayer'

  const { step: approveRelayerStep } = useApproveRelayerStep(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  const { step: approveRelayerRelicsStep } = useApproveRelayerRelicsStep()

  // Get the multicall withdraw step
  const { multicallStep } = useReliquaryWithdrawStep({
    handler,
    simulationQuery,
    slippage,
    relicId: relicId!,
  })

  return [approveRelayerRelicsStep, approveRelayerStep, multicallStep]
}

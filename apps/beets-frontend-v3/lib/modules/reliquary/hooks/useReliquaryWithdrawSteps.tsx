import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useReliquaryWithdrawStep } from './useReliquaryWithdrawStep'
import { Address } from 'viem'

type UseReliquaryWithdrawStepsParams = {
  handler: any
  simulationQuery: any
  relicId: number
  singleTokenOutAddress?: Address
}

export function useReliquaryWithdrawSteps({
  handler,
  simulationQuery,
  relicId,
  singleTokenOutAddress,
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
    relicId,
    singleTokenOutAddress,
  })

  return [approveRelayerRelicsStep, approveRelayerStep, multicallStep]
}

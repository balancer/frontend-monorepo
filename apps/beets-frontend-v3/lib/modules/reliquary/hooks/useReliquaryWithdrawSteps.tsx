import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { RelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useHasApprovedRelayer } from '@repo/lib/modules/relayer/useHasApprovedRelayer'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useHasApprovedRelayerForAllRelics } from './useHasApprovedRelayerForAllRelics'

type UseReliquaryWithdrawStepsParams = {
  removeLiquiditySteps: TransactionStep[]
  relicId?: number
}

export function useReliquaryWithdrawSteps({
  removeLiquiditySteps,
  relicId,
}: UseReliquaryWithdrawStepsParams): TransactionStep[] {
  const { chainId, chain } = usePool()
  const { connector } = useUserAccount()
  const { enableSignatures } = useUserSettings()

  // Reliquary always needs vault relayer approval (even on V2 pools)
  // Determine mode based on wallet capabilities only
  const reliquaryRelayerMode: RelayerMode = useMemo(() => {
    if (enableSignatures === 'no') return 'approveRelayer'
    if (connector?.id === 'walletConnect') return 'approveRelayer'
    if (connector?.id === 'gnosis') return 'approveRelayer'
    if (connector?.id === 'safe') return 'approveRelayer'
    return 'signRelayer' // MetaMask, Coinbase, etc. can sign (gasless)
  }, [enableSignatures, connector])

  const shouldSignRelayer = reliquaryRelayerMode === 'signRelayer'

  // Vault relayer approval (sign or on-chain)
  const { step: approveRelayerStep } = useApproveRelayerStep(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  const signRelayerStep = useSignRelayerStep(chain)

  const { hasApprovedRelayer } = useHasApprovedRelayer(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  // Reliquary NFT approval
  const { step: approveRelayerRelicsStep } = useApproveRelayerRelicsStep()
  const { hasApprovedRelayerForAllRelics } = useHasApprovedRelayerForAllRelics()

  return useMemo(() => {
    let steps = [...removeLiquiditySteps]

    // 1. Prepend reliquary NFT approval if withdrawing from relic
    if (relicId && !hasApprovedRelayerForAllRelics) {
      steps = [approveRelayerRelicsStep, ...steps]
    }

    // 2. Prepend VAULT relayer approval if needed
    if (!hasApprovedRelayer) {
      if (shouldSignRelayer) {
        steps = [signRelayerStep, ...steps]
      } else {
        steps = [approveRelayerStep, ...steps]
      }
    }

    return steps
  }, [
    removeLiquiditySteps,
    relicId,
    hasApprovedRelayerForAllRelics,
    approveRelayerRelicsStep,
    hasApprovedRelayer,
    shouldSignRelayer,
    signRelayerStep,
    approveRelayerStep,
  ])
}

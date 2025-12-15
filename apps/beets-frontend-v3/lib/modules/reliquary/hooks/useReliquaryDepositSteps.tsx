import { useApproveRelayerStep } from '@repo/lib/modules/relayer/useApproveRelayerStep'
import { RelayerMode } from '@repo/lib/modules/relayer/useRelayerMode'
import { useHasApprovedRelayer } from '@repo/lib/modules/relayer/useHasApprovedRelayer'
import { useTokenApprovalSteps } from '@repo/lib/modules/tokens/approvals/useTokenApprovalSteps'
import { getSpenderForAddLiquidity } from '@repo/lib/modules/tokens/token.helpers'
import { useSignRelayerStep } from '@repo/lib/modules/transactions/transaction-steps/useSignRelayerStep'
import { useMemo } from 'react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { LiquidityActionHelpers } from '@repo/lib/modules/pool/actions/LiquidityActionHelpers'
import { useShouldBatchTransactions } from '@repo/lib/modules/web3/safe.hooks'
import { TransactionStep } from '@repo/lib/modules/transactions/transaction-steps/lib'
import { useUserSettings } from '@repo/lib/modules/user/settings/UserSettingsProvider'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { ReliquaryDepositStepParams, useReliquaryDepositStep } from './useReliquaryDepositStep'
import { getApprovalAndAddSteps } from '@repo/lib/modules/pool/actions/add-liquidity/useAddLiquiditySteps'
import { useApproveRelayerRelicsStep } from './useApproveRelayerRelicsStep'
import { useHasApprovedRelayerForAllRelics } from './useHasApprovedRelayerForAllRelics'

export type ReliquaryDepositStepsParams = ReliquaryDepositStepParams & {
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
  const { connector } = useUserAccount()
  const { enableSignatures } = useUserSettings()
  const shouldBatchTransactions = useShouldBatchTransactions()

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
  const { step: approveRelayerStep, isLoading: isLoadingRelayerApproval } = useApproveRelayerStep(
    chainId,
    { relayerMode: reliquaryRelayerMode }
  )

  const signRelayerStep = useSignRelayerStep(chain)

  const { hasApprovedRelayer } = useHasApprovedRelayer(chainId, {
    relayerMode: reliquaryRelayerMode,
  })

  // Reliquary NFT approval
  const { step: approveRelayerRelicsStep, isLoading: isLoadingRelayerRelicsApproval } =
    useApproveRelayerRelicsStep()
  const { hasApprovedRelayerForAllRelics } = useHasApprovedRelayerForAllRelics()

  // Token approvals (V2 only - no permit2)
  const inputAmounts = useMemo(
    () => helpers.toInputAmounts(humanAmountsIn),
    [humanAmountsIn, helpers]
  )

  const { isLoading: isLoadingTokenApprovalSteps, steps: tokenApprovalSteps } =
    useTokenApprovalSteps({
      spenderAddress: getSpenderForAddLiquidity(pool),
      chain: pool.chain,
      approvalAmounts: inputAmounts,
      actionType: 'AddLiquidity',
      isPermit2: false, // V2 pools don't use permit2
    })

  // Reliquary deposit steps (multicall: joinPool + depositIntoReliquary)
  const { addLiquidityStep, depositIntoRelicStep } = useReliquaryDepositStep({
    handler,
    humanAmountsIn,
    simulationQuery,
    slippage,
    createNew,
    relicId,
  })

  // Build steps in correct order
  const allSteps = useMemo<TransactionStep[]>(() => {
    // 1. Get token approval + add liquidity steps
    let steps = getApprovalAndAddSteps({
      isPermit2: false,
      shouldUseSignatures: false, // V2 doesn't use permit2 signatures
      shouldBatchTransactions,
      permit2ApprovalSteps: [],
      tokenApprovalSteps,
      addLiquidityStep,
    })

    // 2. Add deposit into relic step (auto-completes with add liquidity)
    steps = [...steps, depositIntoRelicStep]

    // 3. Prepend reliquary NFT approval if depositing to existing relic
    if (!createNew && relicId && !hasApprovedRelayerForAllRelics) {
      steps = [approveRelayerRelicsStep, ...steps]
    }

    // 4. Prepend VAULT relayer approval if needed
    if (!hasApprovedRelayer) {
      if (shouldSignRelayer) {
        steps = [signRelayerStep, ...steps]
      } else {
        steps = [approveRelayerStep, ...steps]
      }
    }

    return steps
  }, [
    shouldBatchTransactions,
    tokenApprovalSteps,
    addLiquidityStep,
    depositIntoRelicStep,
    createNew,
    relicId,
    hasApprovedRelayerForAllRelics,
    approveRelayerRelicsStep,
    hasApprovedRelayer,
    shouldSignRelayer,
    signRelayerStep,
    approveRelayerStep,
  ])

  return {
    isLoadingSteps:
      isLoadingTokenApprovalSteps || isLoadingRelayerApproval || isLoadingRelayerRelicsApproval,
    steps: allSteps,
  }
}

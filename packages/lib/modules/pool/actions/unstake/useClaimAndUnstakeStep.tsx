/* eslint-disable react-hooks/exhaustive-deps */
import {
  ManagedResult,
  TransactionLabels,
  TransactionStep,
} from '@repo/lib/modules/transactions/transaction-steps/lib'
import { Address, parseUnits } from 'viem'
import { BPT_DECIMALS } from '../../pool.constants'
import { Pool } from '../../pool.types'
import { selectStakingService } from '@repo/lib/modules/staking/selectStakingService'
import { useBuildUnstakeCallData } from './useBuildUnstakeCallData'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { ManagedTransactionInput } from '@repo/lib/modules/web3/contracts/useManagedTransaction'
import { useBalTokenRewards } from '@repo/lib/modules/portfolio/PortfolioClaim/useBalRewards'
import { useClaimableBalances } from '@repo/lib/modules/portfolio/PortfolioClaim/useClaimableBalances'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { useCallback, useMemo, useState } from 'react'
import { ManagedTransactionButton } from '@repo/lib/modules/transactions/transaction-steps/TransactionButton'
import { isTransactionSuccess } from '@repo/lib/modules/transactions/transaction-steps/transaction.helper'
import { useHasApprovedRelayer } from '@repo/lib/modules/relayer/useHasApprovedRelayer'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { HumanAmount } from '@balancer/sdk'

const claimAndUnstakeStepId = 'claim-and-unstake'

export type UnstakeParams = {
  pool: Pool
  gaugeAddress: Address
  amountOut: HumanAmount
  refetchPoolBalances: () => void
}
export function useClaimAndUnstakeStep({
  pool,
  gaugeAddress,
  amountOut, // amount to unstake
  refetchPoolBalances,
}: UnstakeParams): {
  isLoading: boolean
  step: TransactionStep
  hasUnclaimedBalRewards: boolean
} {
  const { userAddress } = useUserAccount()
  const [transaction, setTransaction] = useState<ManagedResult | undefined>()

  const { contracts, chainId } = getNetworkConfig(pool.chain)

  const { claimableRewards: nonBalrewards } = useClaimableBalances([pool])
  const { balRewardsData: balRewards } = useBalTokenRewards([pool])

  const { hasApprovedRelayer, isLoading: isLoadingRelayerApproval } = useHasApprovedRelayer(chainId)

  const labels: TransactionLabels = {
    init: 'Claim & unstake',
    title: 'Claim & unstake',
    description: 'Claim incentives and unstake LP tokens from gauge.',
    confirming: 'Confirming claim & unstake...',
    confirmed: `Claimed & unstaked!`,
    tooltip: 'Claim incentives and unstake LP tokens from gauge.',
  }

  const stakingService = pool.staking
    ? selectStakingService(pool.chain, pool.staking?.type)
    : undefined

  const hasUnclaimedBalRewards = balRewards.length > 0

  const data = useBuildUnstakeCallData({
    amount: parseUnits(amountOut, BPT_DECIMALS),
    gaugeService: stakingService,
    gauges: [gaugeAddress],
    hasUnclaimedNonBalRewards: nonBalrewards.length > 0,
    hasUnclaimedBalRewards,
    userAddress,
  })

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Claim and unstake transaction)',
    {
      poolId: pool.id,
      chainId,
      unstakeArgs: data,
    }
  )

  const props: ManagedTransactionInput = {
    contractAddress: contracts.balancer.relayerV6,
    contractId: 'balancer.relayerV6',
    functionName: 'multicall',
    labels,
    chainId,
    args: [data],
    enabled: !!pool && !isLoadingRelayerApproval && hasApprovedRelayer && data.length > 0,
    txSimulationMeta,
    onTransactionChange: setTransaction,
  }

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
  }, [])

  const step = useMemo(
    (): TransactionStep => ({
      id: claimAndUnstakeStepId,
      stepType: 'claimAndUnstake',
      labels,
      transaction,
      isComplete: () => isTransactionSuccess(transaction),
      onSuccess,
      renderAction: () => <ManagedTransactionButton id={claimAndUnstakeStepId} {...props} />,
    }),
    [transaction, data, props]
  )

  return {
    isLoading: isLoadingRelayerApproval,
    step,
    hasUnclaimedBalRewards,
  }
}

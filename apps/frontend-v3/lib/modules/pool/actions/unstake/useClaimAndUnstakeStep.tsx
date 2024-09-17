/* eslint-disable react-hooks/exhaustive-deps */
import {
  TransactionLabels,
  TransactionStep,
} from '@/lib/modules/transactions/transaction-steps/lib'
import { Address, parseUnits } from 'viem'
import { BPT_DECIMALS } from '../../pool.constants'
import { Pool } from '../../PoolProvider'
import { selectStakingService } from '@/lib/modules/staking/selectStakingService'
import { useBuildUnstakeCallData } from './useBuildUnstakeCallData'
import { getNetworkConfig } from '@/lib/config/app.config'
import { ManagedTransactionInput } from '@/lib/modules/web3/contracts/useManagedTransaction'
import { useBalTokenRewards } from '@/lib/modules/portfolio/PortfolioClaim/useBalRewards'
import { useClaimableBalances } from '@/lib/modules/portfolio/PortfolioClaim/useClaimableBalances'
import { sentryMetaForWagmiSimulation } from '@/lib/shared/utils/query-errors'
import { useCallback, useMemo } from 'react'
import { ManagedTransactionButton } from '@/lib/modules/transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '@/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { useHasApprovedRelayer } from '@/lib/modules/relayer/useHasApprovedRelayer'
import { useUserAccount } from '@/lib/modules/web3/UserAccountProvider'
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
  const { getTransaction } = useTransactionState()
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
  }

  const transaction = getTransaction(claimAndUnstakeStepId)

  const isComplete = () => transaction?.result.isSuccess || false

  const onSuccess = useCallback(() => {
    refetchPoolBalances()
  }, [])

  const step = useMemo(
    (): TransactionStep => ({
      id: claimAndUnstakeStepId,
      stepType: 'claimAndUnstake',
      labels,
      isComplete,
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

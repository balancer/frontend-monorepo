/* eslint-disable react-hooks/exhaustive-deps */
import { Address, parseUnits } from 'viem'
import { BPT_DECIMALS } from '../../pool.constants'
import { Pool } from '../../PoolProvider'
import { useBuildUnstakeCallData } from './useBuildUnstakeCallData'
import { useCallback, useMemo } from 'react'
import { HumanAmount } from '@balancer/sdk'
import { getNetworkConfig } from '../../../../config/app.config'
import { sentryMetaForWagmiSimulation } from '../../../../shared/utils/query-errors'
import { useBalTokenRewards } from '../../../portfolio/PortfolioClaim/useBalRewards'
import { useClaimableBalances } from '../../../portfolio/PortfolioClaim/useClaimableBalances'
import { useHasApprovedRelayer } from '../../../relayer/useHasApprovedRelayer'
import { selectStakingService } from '../../../staking/selectStakingService'
import { TransactionStep, TransactionLabels } from '../../../transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '../../../transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '../../../transactions/transaction-steps/TransactionStateProvider'
import { ManagedTransactionInput } from '../../../web3/contracts/useManagedTransaction'
import { useUserAccount } from '../../../web3/UserAccountProvider'

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
    },
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
    [transaction, data, props],
  )

  return {
    isLoading: isLoadingRelayerApproval,
    step,
    hasUnclaimedBalRewards,
  }
}

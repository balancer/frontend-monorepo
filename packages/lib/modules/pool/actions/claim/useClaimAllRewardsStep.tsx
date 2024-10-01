import { getChainId } from '@repo/lib/config/app.config'
import { useMemo, useState } from 'react'
import { ManagedTransactionInput } from '../../../web3/contracts/useManagedTransaction'
import { useUserAccount } from '../../../web3/UserAccountProvider'
import { useClaimCallDataQuery } from './useClaimCallDataQuery'
import { ClaimablePool } from './ClaimProvider'
import { Address } from 'viem'
import networkConfigs from '@repo/lib/config/networks'
import { GqlChain, GqlPoolStakingType } from '@repo/lib/shared/services/api/generated/graphql'
import { sentryMetaForWagmiSimulation } from '@repo/lib/shared/utils/query-errors'
import { BalTokenRewardsResult } from '../../../portfolio/PortfolioClaim/useBalRewards'
import { ClaimableBalancesResult } from '../../../portfolio/PortfolioClaim/useClaimableBalances'
import { selectStakingService } from '../../../staking/selectStakingService'
import { TransactionLabels, TransactionStep } from '../../../transactions/transaction-steps/lib'
import { ManagedTransactionButton } from '../../../transactions/transaction-steps/TransactionButton'
import { useTransactionState } from '../../../transactions/transaction-steps/TransactionStateProvider'

const claimAllRewardsStepId = 'claim-all-rewards'

export type ClaimAllRewardsStepParams = {
  pools: ClaimablePool[]
  claimableBalancesQuery: ClaimableBalancesResult
  balTokenRewardsQuery: BalTokenRewardsResult
}

export function useClaimAllRewardsStep({
  pools,
  claimableBalancesQuery,
  balTokenRewardsQuery,
}: ClaimAllRewardsStepParams) {
  const [isClaimQueryEnabled, setIsClaimQueryEnabled] = useState(false)
  const { getTransaction } = useTransactionState()
  const { isConnected } = useUserAccount()
  const { claimableRewards: nonBalRewards, refetchClaimableRewards } = claimableBalancesQuery
  const { balRewardsData: balRewards, refetchBalRewards } = balTokenRewardsQuery

  const pool = pools[0]
  if (!pool) {
    throw new Error('Pools should contain at least one element')
  }

  const chain = pool.chain as GqlChain
  const stakingType = pool.staking?.type || GqlPoolStakingType.Gauge

  const claimRewardGauges = nonBalRewards.map(r => r.gaugeAddress)
  const mintBalRewardGauges = balRewards.map(r => r.gaugeAddress as Address)
  const allRewardGauges = [...claimRewardGauges, ...mintBalRewardGauges]
  const shouldClaimMany = allRewardGauges.length > 1

  const stakingService = selectStakingService(chain, stakingType)
  const { data: claimData, isLoading } = useClaimCallDataQuery({
    claimRewardGauges,
    mintBalRewardGauges,
    gaugeService: stakingService,
    enabled: isClaimQueryEnabled,
  })

  const labels: TransactionLabels = {
    init: `Claim${shouldClaimMany ? ' all' : ''}`,
    title: `Claim${shouldClaimMany ? ' all' : ''}`,
    confirming: 'Confirming claim...',
    confirmed: 'Claimed!',
    tooltip: shouldClaimMany
      ? 'Claim all rewards from your gauges'
      : 'Claim all rewards from your gauge',
  }

  const txSimulationMeta = sentryMetaForWagmiSimulation(
    'Error in wagmi tx simulation (Claim all rewards transaction)',
    {
      poolId: pool.id,
      chain,
      claimData,
      stakingType,
      allRewardGauges,
    }
  )

  const props: ManagedTransactionInput = {
    labels,
    chainId: getChainId(chain),
    contractId: 'balancer.relayerV6',
    contractAddress: networkConfigs[chain].contracts.balancer.relayerV6,
    functionName: 'multicall',
    args: [claimData],
    enabled: allRewardGauges.length > 0 && claimData && claimData.length > 0,
    txSimulationMeta,
  }

  const transaction = getTransaction(claimAllRewardsStepId)

  const isComplete = () => isConnected && !!transaction?.result.isSuccess

  const step = useMemo(
    (): TransactionStep => ({
      id: claimAllRewardsStepId,
      labels,
      stepType: 'claim',
      isComplete,
      onActivated: () => setIsClaimQueryEnabled(true),
      onDeactivated: () => setIsClaimQueryEnabled(false),
      onSuccess: () => {
        refetchClaimableRewards()
        refetchBalRewards()
      },
      renderAction: () => <ManagedTransactionButton id={claimAllRewardsStepId} {...props} />,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [transaction, claimData, isLoading]
  )
  return { step, isLoading }
}

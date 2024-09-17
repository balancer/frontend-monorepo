import { getChainId } from '@/lib/config/app.config'
import { bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { Address, formatUnits } from 'viem'
import { useReadContracts, type UseReadContractsReturnType } from 'wagmi'
import { useTokens } from '../../tokens/TokensProvider'
import { AbiMap } from '../../web3/contracts/AbiMap'
import { useUserAccount } from '../../web3/UserAccountProvider'
import { BPT_DECIMALS } from '../../pool/pool.constants'
import { ClaimablePool } from '../../pool/actions/claim/ClaimProvider'
import { GqlChain, GqlPoolStakingGaugeReward } from '@/lib/shared/services/api/generated/graphql'
import { groupBy, uniqBy } from 'lodash'
import { onlyExplicitRefetch } from '@/lib/shared/utils/queries'

interface ClaimableRewardRef {
  tokenAddress: Address
  gaugeAddress: Address
  chain: GqlChain
  poolId: string
}

export interface ClaimableReward extends ClaimableRewardRef {
  balance: bigint
  decimals?: number
  humanBalance: string
  fiatBalance: BigNumber
}

export type ClaimableBalancesResult = ReturnType<typeof useClaimableBalances>

const getClaimableRewardRefs = (rewards: GqlPoolStakingGaugeReward[], pool: ClaimablePool) => {
  return rewards.map(reward => ({
    chain: pool.chain,
    poolId: pool.id,
    tokenAddress: reward.tokenAddress as Address,
    gaugeAddress: pool.staking?.gauge?.gaugeAddress as Address,
  }))
}

export function useClaimableBalances(pools: ClaimablePool[]) {
  const { userAddress, isConnected } = useUserAccount()
  const { priceFor, getToken } = useTokens()

  // List of all reward tokens from provided pools
  const rewardTokenRefs: ClaimableRewardRef[] = useMemo(
    () =>
      pools.flatMap(pool => {
        const otherGauges = pool.staking?.gauge?.otherGauges || []
        const gaugeRewardTokens = pool.staking?.gauge?.rewards || []

        const otherRewardTokenRefs = otherGauges.flatMap(gauge =>
          getClaimableRewardRefs(gauge.rewards, pool)
        )

        const allRewardTokenRefs = [
          ...getClaimableRewardRefs(gaugeRewardTokens, pool),
          ...otherRewardTokenRefs,
        ]

        return uniqBy(allRewardTokenRefs, reward => `${reward.gaugeAddress}.${reward.tokenAddress}`)
      }),
    [pools]
  )

  // Get claimable rewards for each reward token
  const claimableRewardContractCalls = rewardTokenRefs.map(rewardRef => {
    return {
      chainId: getChainId(rewardRef.chain),
      id: `${rewardRef.gaugeAddress}.${rewardRef.tokenAddress}`,
      abi: AbiMap['balancer.gaugeV5'],
      address: rewardRef.gaugeAddress,
      functionName: 'claimable_reward',
      args: [userAddress, rewardRef.tokenAddress],
    }
  })

  const { data, refetch, isLoading, status }: UseReadContractsReturnType = useReadContracts({
    contracts: claimableRewardContractCalls,
    query: {
      enabled: isConnected,
      // In chains like polygon, we don't want background refetches while waiting for min block confirmations
      ...onlyExplicitRefetch,
    },
  })

  // Format claimable rewards data
  const claimableRewards = (data || [])
    .map((data, i) => {
      if (data.status === 'failure') return // Discard calls with error

      const balance = data.result as bigint
      if (!balance) return // Discard calls with no reward

      const rewardTokenRef = rewardTokenRefs[i]

      if (!rewardTokenRef) return

      const { gaugeAddress, tokenAddress, chain, poolId } = rewardTokenRef
      const tokenPrice = priceFor(tokenAddress, chain)
      const decimals = getToken(tokenAddress, chain)?.decimals || BPT_DECIMALS
      const fiatBalance = tokenPrice
        ? bn(formatUnits(balance, decimals)).multipliedBy(tokenPrice)
        : bn(0)

      const reward: ClaimableReward = {
        chain,
        poolId,
        tokenAddress,
        gaugeAddress,
        balance,
        fiatBalance,
        humanBalance: formatUnits(balance, decimals) || '0',
        decimals,
      }

      return reward
    })
    .filter(Boolean) as ClaimableReward[]

  const claimableRewardsByPoolMap: Record<string, ClaimableReward[]> = useMemo(() => {
    return groupBy(claimableRewards, 'poolId')
  }, [claimableRewards])

  return {
    claimableRewardsByPoolMap,
    claimableRewards,
    refetchClaimableRewards: refetch,
    isLoadingClaimableRewards: isLoading,
    isLoadedClaimableRewards: status === 'success',
  }
}

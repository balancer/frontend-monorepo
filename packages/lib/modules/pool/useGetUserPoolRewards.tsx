'use client'

import { useMemo } from 'react'
import { sumBy } from 'lodash'
import { Pool } from './pool.types'
import { safeTokenFormat } from '@repo/lib/shared/utils/numbers'
import { useGetPoolRewards } from './useGetPoolRewards'
import { BalTokenReward } from '../portfolio/PortfolioClaim/useBalRewards'
import { ClaimableReward } from '../portfolio/PortfolioClaim/useClaimableBalances'

export type GetUserPoolRewardsParams = {
  pool: Pool
  balRewards: BalTokenReward[]
  nonBalRewards: ClaimableReward[]
}

export function useGetUserPoolRewards({
  pool,
  balRewards,
  nonBalRewards,
}: GetUserPoolRewardsParams) {
  const { tokens } = useGetPoolRewards(pool)

  const claimableRewards = useMemo(
    () => [...balRewards, ...nonBalRewards],
    [balRewards, nonBalRewards]
  )

  const myClaimableRewards = useMemo(
    () => sumBy(claimableRewards, reward => reward.fiatBalance.toNumber()),
    [claimableRewards]
  )

  const rewardsByToken = useMemo(() => {
    if (!tokens.length) return {}

    const balanceMap: Record<string, string> = {}

    claimableRewards.forEach(reward => {
      if (reward.tokenAddress) {
        const token = tokens.find(t => t?.address === reward.tokenAddress)
        const decimals = token?.decimals || 18

        balanceMap[reward.tokenAddress] = safeTokenFormat(reward.balance, decimals)
      }
    })

    return balanceMap
  }, [claimableRewards, tokens])

  return {
    claimableRewards,
    myClaimableRewards,
    tokens,
    rewardsByToken,
  }
}

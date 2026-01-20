'use client'

import { useState, PropsWithChildren, createContext } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { GqlChain, GqlPoolSnapshotDataRange } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { sumBy } from 'lodash'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useGetRelicPositionsOfOwner } from './hooks/useGetRelicPositionsOfOwner'
import { useGetLevelInfo } from './hooks/useGetLevelInfo'
import { useGetPendingRewards } from './hooks/useGetPendingRewards'

// Export types for legacy compatibility
export type ReliquaryFarmPosition = {
  farmId: string
  relicId: string
  amount: string
  entry: number
  level: number
}

export type ReliquaryDepositImpact = {
  oldMaturity: number
  newMaturity: number
  oldLevel: number
  newLevel: number
  oldLevelProgress: string
  newLevelProgress: string
  depositImpactTimeInMilliseconds: number
  staysMax: boolean
}

const CHAIN = GqlChain.Sonic

export function useReliquaryLogic() {
  const { pool } = usePool()
  const { isConnected } = useUserAccount()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()
  const [range, setRange] = useState<GqlPoolSnapshotDataRange>(GqlPoolSnapshotDataRange.ThirtyDays)
  const { priceFor } = useTokens()

  const networkConfig = getNetworkConfig(CHAIN)

  const disabledConditions: [boolean, string][] = [[!isConnected, LABELS.walletNotConnected]]
  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  // these values are always available on Sonic
  const beetsAddress = networkConfig.tokens.addresses.beets!
  const farmId = networkConfig.reliquary!.fbeets.farmId!.toString()

  const relicPositionsOfOwnerQuery = useGetRelicPositionsOfOwner(CHAIN)

  const {
    relics: relicPositionsRaw = [],
    isLoading: isLoadingRelicPositions,
    refetch: refetchRelicPositions,
  } = relicPositionsOfOwnerQuery

  const relicPositions = relicPositionsRaw.map(position => ({
    farmId: position.poolId,
    relicId: position.relicId,
    amount: position.amount,
    entry: position.entry,
    level: position.level,
  }))

  const levelInfoQuery = useGetLevelInfo(farmId, CHAIN)

  const {
    maturityThresholds: maturityThresholds = [],
    isLoading: isLoadingMaturityThresholds,
    refetch: refetchMaturityThresholds,
  } = levelInfoQuery

  const relicIds = relicPositions.map(relic => parseInt(relic.relicId))
  const beetsPerSecond = pool?.staking?.reliquary?.beetsPerSecond || '0'
  const reliquaryLevels = pool?.staking?.reliquary?.levels || []

  const weightedTotalBalance = sumBy(
    reliquaryLevels,
    level => parseFloat(level.balance) * level.allocationPoints
  )

  const relicPositionsForFarmId = relicPositions.filter(
    position => position.farmId.toString() === farmId
  )
  const totalMaBeetsVP = sumBy(relicPositionsForFarmId, position => {
    const numFBeets = parseFloat(position.amount)
    const boost = reliquaryLevels.find(level => level.level === position.level)
    return ((boost?.allocationPoints || 0) / 100) * numFBeets
  })

  const pendingRewardsQuery = useGetPendingRewards({
    chain: CHAIN,
    farmIds: [farmId],
    relicPositions,
  })

  const {
    data: pendingRewardsData,
    isLoading: isLoadingPendingRewards,
    refetch: refetchPendingRewards,
  } = pendingRewardsQuery

  const beetsPrice = priceFor(beetsAddress, networkConfig.chain)

  const totalPendingRewardsUSD =
    parseFloat(pendingRewardsData?.rewards[0]?.amount || '0') * beetsPrice

  const isLoading =
    isLoadingRelicPositions || isLoadingMaturityThresholds || isLoadingPendingRewards

  return {
    chain: CHAIN,
    isDisabled,
    disabledReason,
    hasValidationError,
    getValidationError,
    range,
    setRange,
    relicPositions,
    isLoadingRelicPositions,
    isLoading,
    maturityThresholds,
    levelInfoQuery,
    beetsPerSecond,
    beetsPerDay: parseFloat(beetsPerSecond) * 86400,
    weightedTotalBalance,
    reliquaryLevels,
    relicIds,
    relicPositionsForFarmId,
    totalMaBeetsVP,
    refetchRelicPositions,
    refetchMaturityThresholds,
    totalPendingRewardsUSD,
    pendingRewardsData,
    pendingRewardsQuery,
    refetchPendingRewards,
  }
}

export type Result = ReturnType<typeof useReliquaryLogic>
export const ReliquaryContext = createContext<Result | null>(null)

export function ReliquaryProvider({ children }: PropsWithChildren) {
  const reliquary = useReliquaryLogic()

  return <ReliquaryContext.Provider value={reliquary}>{children}</ReliquaryContext.Provider>
}

export const useReliquary = (): Result => useMandatoryContext(ReliquaryContext, 'Reliquary')

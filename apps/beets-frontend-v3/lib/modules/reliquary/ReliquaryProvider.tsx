'use client'

import { useState, PropsWithChildren, createContext, useCallback, useRef } from 'react'
import { useMandatoryContext } from '@repo/lib/shared/utils/contexts'
import { GqlChain, GqlPoolSnapshotDataRange } from '@repo/lib/shared/services/api/generated/graphql'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { LABELS } from '@repo/lib/shared/labels'
import { isDisabledWithReason } from '@repo/lib/shared/utils/functions/isDisabledWithReason'
import { useTokenInputsValidation } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { useTransactionSteps } from '@repo/lib/modules/transactions/transaction-steps/useTransactionSteps'
import { useLevelUpStep } from './hooks/useLevelUpStep'
import { ReliquaryPosition } from './reliquary.types'
import { useClaimRewardsSteps } from './hooks/useClaimRewardsSteps'
import { usePublicClient } from '@repo/lib/shared/utils/wagmi'
import { reliquaryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { formatUnits, Address } from 'viem'
import { sumBy } from 'lodash'
import { makeVar, useReactiveVar } from '@apollo/client'
import { useQuery } from '@tanstack/react-query'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'

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

export type TokenAmountHumanReadable = {
  address: string
  amount: string
}

const CHAIN = GqlChain.Sonic

// Apollo Client reactive variables for state management
const selectedRelicIdVar = makeVar<string | undefined>(undefined)
const createRelicVar = makeVar<boolean>(false)

export function useReliquaryLogic() {
  const { isConnected, userAddress } = useUserAccount()
  const { hasValidationError, getValidationError } = useTokenInputsValidation()
  const [range, setRange] = useState<GqlPoolSnapshotDataRange>(GqlPoolSnapshotDataRange.ThirtyDays)
  const [selectedRelic, setSelectedRelic] = useState<ReliquaryPosition | undefined>(undefined)
  const publicClient = usePublicClient()
  const networkConfig = getNetworkConfig(CHAIN)
  const reliquaryAddress = networkConfig.contracts.beets?.reliquary
  const beetsAddress = networkConfig.tokens.addresses.beets
  const { pool } = usePool()

  const disabledConditions: [boolean, string][] = [[!isConnected, LABELS.walletNotConnected]]
  const { isDisabled, disabledReason } = isDisabledWithReason(...disabledConditions)

  const { step: levelUpStep } = useLevelUpStep(CHAIN, selectedRelic?.relicId)
  const levelUpTransactionSteps = useTransactionSteps([levelUpStep], false)
  const levelUpTxHash = levelUpTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const levelUpTxConfirmed = levelUpTransactionSteps.lastTransactionConfirmed

  const { steps: claimRewardsSteps } = useClaimRewardsSteps(CHAIN, selectedRelic?.relicId)
  const claimRewardsTransactionSteps = useTransactionSteps(claimRewardsSteps, false)
  const claimRewardsTxHash =
    claimRewardsTransactionSteps.lastTransaction?.result?.data?.transactionHash
  const claimRewardsTxConfirmed = claimRewardsTransactionSteps.lastTransactionConfirmed

  // Queries for positions and maturity thresholds
  const {
    data: relicPositionsUnsorted = [],
    isLoading: isLoadingRelicPositions,
    refetch: refetchRelicPositions,
  } = useQuery({
    queryKey: ['reliquaryAllPositions', userAddress],
    queryFn: async () => {
      const positions: ReliquaryFarmPosition[] = await getAllPositions(userAddress || '')

      if (positions.length > 0 && selectedRelicIdVar() === undefined) {
        selectedRelicIdVar(positions[0].relicId)
      }

      return positions
    },
    enabled: !!userAddress && !!reliquaryAddress,
  })

  const relicPositions = relicPositionsUnsorted.sort(
    (a, b) => parseInt(a.relicId) - parseInt(b.relicId)
  )

  const {
    data: maturityThresholds = [],
    isLoading: isLoadingMaturityThresholds,
    refetch: refetchMaturityThresholds,
  } = useQuery<string[]>({
    queryKey: ['maturityThresholds', reliquaryAddress],
    queryFn: async () => {
      // TODO: get farmId from network config
      return await getMaturityThresholds('0')
    },
    refetchOnWindowFocus: false,
  })

  // Derived state and calculations
  const selectedRelicIdValue = useReactiveVar(selectedRelicIdVar)
  const createRelicValue = useReactiveVar(createRelicVar)
  const selectedRelicFromPositions =
    relicPositions.find(position => position.relicId === selectedRelicIdValue) || null
  const isLoading = isLoadingRelicPositions || isLoadingMaturityThresholds
  const relicIds = relicPositions.map(relic => parseInt(relic.relicId))

  const beetsPerSecond = pool?.staking?.reliquary?.beetsPerSecond || '0'
  const reliquaryLevels = pool?.staking?.reliquary?.levels || []

  const selectedRelicLevel = reliquaryLevels.find(
    level => level.level === selectedRelicFromPositions?.level
  )

  const weightedTotalBalance = sumBy(
    reliquaryLevels,
    level => parseFloat(level.balance) * level.allocationPoints
  )

  const relicPositionsForFarmId = relicPositions.filter(
    position => position.farmId.toString() === '0'
  ) // TODO: get farmId from network config
  const totalMaBeetsVP = sumBy(relicPositionsForFarmId, position => {
    const numFBeets = parseFloat(position.amount)
    const boost = reliquaryLevels.find(level => level.level === position.level)
    return ((boost?.allocationPoints || 0) / 100) * numFBeets
  })

  function setCreateRelic(value: boolean) {
    createRelicVar(value)
  }

  function setSelectedRelicId(value: string) {
    selectedRelicIdVar(value)
  }

  // Service methods using viem/wagmi (for legacy file compatibility)
  const getAllPositions = useCallback(
    async (userAddress: string): Promise<ReliquaryFarmPosition[]> => {
      if (!publicClient || !reliquaryAddress) return []

      try {
        const result = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'relicPositionsOfOwner',
          args: [userAddress as Address],
        })

        const [relicIds, positionInfos] = result as [
          bigint[],
          Array<{
            amount: bigint
            rewardDebt: bigint
            rewardCredit: bigint
            entry: bigint
            poolId: bigint
            level: bigint
          }>,
        ]

        return positionInfos.map((position, index) => ({
          farmId: position.poolId.toString(),
          relicId: relicIds[index].toString(),
          amount: formatUnits(position.amount, 18),
          entry: Number(position.entry),
          level: Number(position.level),
        }))
      } catch (error) {
        console.error('Error getting all positions:', error)
        return []
      }
    },
    [publicClient, reliquaryAddress]
  )

  const getPendingRewardsForRelic = useCallback(
    async (relicId: string): Promise<TokenAmountHumanReadable[]> => {
      if (!publicClient || !reliquaryAddress || !beetsAddress) return []

      try {
        const pendingReward = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'pendingReward',
          args: [BigInt(relicId)],
        })

        return [{ address: beetsAddress, amount: formatUnits(pendingReward as bigint, 18) }]
      } catch (error) {
        console.error('Error getting pending rewards for relic:', error)
        return []
      }
    },
    [publicClient, reliquaryAddress, beetsAddress]
  )

  const getPendingRewards = useCallback(
    async (
      farmIds: string[],
      userAddress: string
    ): Promise<{
      rewards: { address: string; amount: string }[]
      relicIds: number[]
      numberOfRelics: number
      fBEETSTotalBalance: string
    }> => {
      if (!publicClient || !reliquaryAddress || !beetsAddress) {
        return { rewards: [], relicIds: [], numberOfRelics: 0, fBEETSTotalBalance: '0' }
      }

      try {
        const allPositions = await getAllPositions(userAddress)
        const filteredPositions = allPositions.filter(position => farmIds.includes(position.farmId))

        const pendingRewards = await Promise.all(
          filteredPositions.map(async position => {
            try {
              const pendingReward = await publicClient.readContract({
                address: reliquaryAddress as Address,
                abi: reliquaryAbi,
                functionName: 'pendingReward',
                args: [BigInt(position.relicId)],
              })

              return {
                id: position.farmId,
                relicId: position.relicId,
                address: beetsAddress,
                amount: formatUnits(pendingReward as bigint, 18),
                fBEETSBalance: position.amount,
              }
            } catch {
              return null
            }
          })
        )

        const validRewards = pendingRewards.filter((r): r is NonNullable<typeof r> => r !== null)
        const relicIds = validRewards.map(reward => parseInt(reward.relicId))
        const totalAmount = sumBy(validRewards, reward => parseFloat(reward.amount)).toString()

        return {
          rewards: [{ address: beetsAddress, amount: totalAmount }],
          relicIds,
          numberOfRelics: relicIds.length,
          fBEETSTotalBalance: sumBy(validRewards, reward =>
            parseFloat(reward.fBEETSBalance)
          ).toString(),
        }
      } catch (error) {
        console.error('Error getting pending rewards:', error)
        return { rewards: [], relicIds: [], numberOfRelics: 0, fBEETSTotalBalance: '0' }
      }
    },
    [publicClient, reliquaryAddress, beetsAddress, getAllPositions]
  )

  const getMaturityThresholds = useCallback(
    async (pid: string): Promise<string[]> => {
      if (!publicClient || !reliquaryAddress) return []

      try {
        const poolLevelInfo = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'getLevelInfo',
          args: [BigInt(pid)],
        })

        const requiredMaturities = (poolLevelInfo as any).requiredMaturities as bigint[]
        return requiredMaturities.map(maturity => maturity.toString())
      } catch (error) {
        console.error('Error getting maturity thresholds:', error)
        return []
      }
    },
    [publicClient, reliquaryAddress]
  )

  const getPositionForRelicId = useCallback(
    async (relicId: string): Promise<ReliquaryFarmPosition | null> => {
      if (!publicClient || !reliquaryAddress) return null

      try {
        const position = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'getPositionForId',
          args: [BigInt(relicId)],
        })

        const positionData = position as {
          amount: bigint
          rewardDebt: bigint
          rewardCredit: bigint
          entry: bigint
          poolId: bigint
          level: bigint
        }

        return {
          farmId: positionData.poolId.toString(),
          relicId,
          amount: formatUnits(positionData.amount, 18),
          entry: Number(positionData.entry),
          level: Number(positionData.level),
        }
      } catch (error) {
        console.error('Error getting position for relic:', error)
        return null
      }
    },
    [publicClient, reliquaryAddress]
  )

  const getLevelOnUpdate = useCallback(
    async (relicId: string): Promise<number> => {
      if (!publicClient || !reliquaryAddress) return 0

      try {
        const levelOnUpdate = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'levelOnUpdate',
          args: [BigInt(relicId)],
        })

        return Number(levelOnUpdate as bigint)
      } catch (error) {
        console.error('Error getting level on update:', error)
        return 0
      }
    },
    [publicClient, reliquaryAddress]
  )

  const getDepositImpact = useCallback(
    async (
      amount: number,
      relicId: string,
      maxLevel: number = 5
    ): Promise<ReliquaryDepositImpact | null> => {
      if (!publicClient || !reliquaryAddress) return null

      try {
        const position = await getPositionForRelicId(relicId)
        if (!position) return null

        const levelOnUpdate = await getLevelOnUpdate(relicId)
        const poolLevelInfo = await publicClient.readContract({
          address: reliquaryAddress as Address,
          abi: reliquaryAbi,
          functionName: 'getLevelInfo',
          args: [BigInt(position.farmId)],
        })

        const maturityLevels = (poolLevelInfo as any).requiredMaturities as bigint[]
        const weight = amount / (amount + parseFloat(position.amount))
        const nowTimestamp = Math.floor(Date.now() / 1000)
        const maturity = nowTimestamp - position.entry
        const entryTimestampAfterDeposit = Math.round(position.entry + maturity * weight)
        const newMaturity = nowTimestamp - entryTimestampAfterDeposit

        let newLevel = 0
        maturityLevels.forEach((level, i) => {
          if (newMaturity >= Number(level)) {
            newLevel = i
          }
        })

        const oldLevelProgress =
          levelOnUpdate >= maturityLevels.length - 1
            ? 'max level reached'
            : `${maturity}/${maturityLevels[levelOnUpdate + 1]}`
        const newLevelProgress =
          newLevel > maturityLevels.length
            ? 'max level reached'
            : `${newMaturity}/${maturityLevels[newLevel + 1]}`

        const depositImpactTimeInMilliseconds = (maturity - newMaturity) * 1000
        const staysMax = levelOnUpdate === maxLevel && newLevel === maxLevel

        return {
          oldMaturity: maturity,
          newMaturity,
          oldLevel: levelOnUpdate,
          newLevel,
          oldLevelProgress,
          newLevelProgress,
          depositImpactTimeInMilliseconds,
          staysMax,
        }
      } catch (error) {
        console.error('Error getting deposit impact:', error)
        return null
      }
    },
    [publicClient, reliquaryAddress, getPositionForRelicId, getLevelOnUpdate]
  )

  const getUserStakedBalance = useCallback(
    async (userAddress: string, farmId: string): Promise<string> => {
      try {
        const positions = await getAllPositions(userAddress)
        return positions
          .filter(position => position.farmId === farmId)
          .reduce((total, position) => total + parseFloat(position.amount), 0)
          .toString()
      } catch (error) {
        console.error('Error getting user staked balance:', error)
        return '0'
      }
    },
    [getAllPositions]
  )

  return {
    chain: CHAIN,
    isDisabled,
    disabledReason,
    hasValidationError,
    getValidationError,
    range,
    setRange,
    selectedRelic: selectedRelic || selectedRelicFromPositions,
    setSelectedRelic,
    levelUpTransactionSteps,
    levelUpTxHash,
    levelUpTxConfirmed,
    claimRewardsTransactionSteps,
    claimRewardsTxHash,
    claimRewardsTxConfirmed,
    // Reliquary-specific state and data
    relicPositions,
    isLoadingRelicPositions,
    isLoading,
    maturityThresholds,
    selectedRelicId: selectedRelicIdValue,
    selectedRelicApr: selectedRelicLevel?.apr || '0',
    beetsPerSecond,
    beetsPerDay: parseFloat(beetsPerSecond) * 86400,
    selectedRelicLevel,
    weightedTotalBalance,
    createRelic: createRelicValue,
    relicIds,
    relicPositionsForFarmId,
    totalMaBeetsVP,
    setCreateRelic,
    setSelectedRelicId,
    refetchRelicPositions,
    refetchMaturityThresholds,
    // Service methods (for legacy compatibility with files still using old patterns)
    getAllPositions,
    getPendingRewardsForRelic,
    getPendingRewards,
    getMaturityThresholds,
    getPositionForRelicId,
    getLevelOnUpdate,
    getDepositImpact,
    getUserStakedBalance,
  }
}

export type Result = ReturnType<typeof useReliquaryLogic>
export const ReliquaryContext = createContext<Result | null>(null)

export function ReliquaryProvider({ children }: PropsWithChildren) {
  const Reliquary = useReliquaryLogic()

  return <ReliquaryContext.Provider value={Reliquary}>{children}</ReliquaryContext.Provider>
}

export const useReliquary = (): Result => useMandatoryContext(ReliquaryContext, 'Reliquary')

'use client'

import { SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { useReliquary } from '../../ReliquaryProvider'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { useQuery } from '@tanstack/react-query'
import { zeroAddress } from 'viem'

export function YourMaBeetsStats() {
  const {
    relicPositions,
    totalMaBeetsVP,
    getPendingRewards,
    isLoading: isLoadingReliquary,
  } = useReliquary()
  const { bptPrice } = usePool()
  const { priceFor } = useTokens()
  const { latest: globalStats, loading: isLoadingGlobalStats } = useReliquaryGlobalStats()
  const { userAddress } = useUserAccount()
  const networkConfig = useNetworkConfig()

  const isLoading = isLoadingReliquary || isLoadingGlobalStats

  // Calculate total user fBEETS balance - used by multiple stats below
  const userTotalBalance = relicPositions.reduce((sum, relic) => sum + parseFloat(relic.amount), 0)

  // Calculate Total Liquidity
  const totalLiquidity = userTotalBalance * bptPrice

  // Calculate Average Maturity Level (weighted by balance)
  const avgMaturityLevel =
    relicPositions.length > 0 && userTotalBalance > 0
      ? relicPositions.reduce((sum, relic) => {
          const weight = parseFloat(relic.amount) / userTotalBalance
          return sum + (relic.level + 1) * weight // +1 because levels are 0-indexed
        }, 0)
      : 0

  // Fetch pending rewards asynchronously
  const { data: pendingRewardsData } = useQuery({
    queryKey: ['reliquaryPendingRewards', userAddress],
    queryFn: async () => {
      const farmId = networkConfig.reliquary?.fbeets.farmId?.toString() ?? '0'
      return await getPendingRewards([farmId], userAddress || '')
    },
    enabled: !!userAddress && relicPositions.length > 0,
  })

  // Calculate Total Pending Rewards in USD
  const beetsAddress = networkConfig.tokens.addresses.beets || zeroAddress
  const beetsPrice = priceFor(beetsAddress, networkConfig.chain)
  const totalPendingRewardsUSD =
    parseFloat(pendingRewardsData?.rewards[0]?.amount || '0') * beetsPrice

  // Calculate Total Relic Share as percentage
  const globalTotalBalance = parseFloat(globalStats?.totalBalance || '1') // Avoid division by zero
  const relicShareDecimal = globalTotalBalance > 0 ? userTotalBalance / globalTotalBalance : 0

  return (
    <VStack align="flex-start" flex="1" spacing="4" width="full">
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        Your maBEETs Summary
      </Text>
      <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="Your Relics" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{relicPositions.length}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Liquidity" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>${fNum('fiat', totalLiquidity)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Maturity Lvl" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNumCustom(avgMaturityLevel, '0.00')}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Pending Rewards" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>${fNum('fiat', totalPendingRewardsUSD)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Relic Share" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNum('sharePercent', relicShareDecimal)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Voting Power" />
          <Skeleton isLoaded={!isLoading} width="50%">
            <StatValueText>{fNumCustom(totalMaBeetsVP, '0.000a')} maBEETS</StatValueText>
          </Skeleton>
        </RelicStat>
      </SimpleGrid>
    </VStack>
  )
}

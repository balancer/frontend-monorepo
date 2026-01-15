'use client'

import { Box, HStack, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'
import { getTotalAprLabel } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { useCurrentDate } from '@repo/lib/shared/hooks/date.hooks'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { startOfWeek } from 'date-fns'
import { zeroAddress } from 'viem'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'
import { ReliquaryCurveChart } from '../charts/ReliquaryCurveChart'
import { ReliquaryDetailsCharts } from '../charts/ReliquaryDetailsCharts'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'

export default function ReliquaryGlobalStats() {
  const { pool } = usePool()
  const { priceFor } = useTokens()
  const { data: snapshots, latest: globalStats, loading, error } = useReliquaryGlobalStats()
  const networkConfig = useNetworkConfig()
  const today = useCurrentDate()

  const data = pool.dynamicData

  const beetsPerDay = parseFloat(pool.staking?.reliquary?.beetsPerSecond || '0') * 86400
  const incentivesDailyValue =
    beetsPerDay * priceFor(networkConfig.tokens.addresses.beets || zeroAddress, networkConfig.chain)

  // Calculate Relic maturity levels
  const relicMaturityLevels = globalStats?.levelBalances.map((balance: any) => ({
    level: parseInt(balance.level) + 1,
    percentageOfTotal: parseFloat(balance.balance) / parseFloat(globalStats.totalBalance),
  }))
  const avgRelicMaturity = fNumCustom(
    relicMaturityLevels?.reduce(
      (total: number, obj: any) => total + obj.level * obj.percentageOfTotal,
      0
    ) || 0,
    '0.00'
  )

  const cutOffDate = startOfWeek(today).getTime()
  const snapshotsThisWeek = snapshots?.snapshots.filter(
    (snapshot: any) => snapshot.timestamp >= cutOffDate / 1000
  )

  let numberOfRelicsThisWeek = 0
  if (snapshotsThisWeek) {
    numberOfRelicsThisWeek =
      parseInt(snapshotsThisWeek[snapshotsThisWeek.length - 1]?.relicCount || '') -
      parseInt(snapshotsThisWeek[0]?.relicCount || '')
    if (Number.isNaN(numberOfRelicsThisWeek)) {
      numberOfRelicsThisWeek = 0
    }
  }

  const reliquaryPoolRatio =
    parseFloat(globalStats?.totalBalance || '') / parseFloat(data.totalShares)
  const tvl = reliquaryPoolRatio * parseFloat(data.totalLiquidity)
  const avgValuePerRelic = tvl / parseInt(globalStats?.relicCount || '')

  const baseApr = pool.dynamicData.aprItems.find(
    item => item.title === 'BEETS reward APR' && item.type === 'MABEETS_EMISSIONS'
  )

  const dynamicDataAprItems = pool.dynamicData.aprItems.map(item => {
    if (item.title === 'BEETS reward APR' && item.type === 'STAKING_BOOST') {
      return {
        ...item,
        apr: item.apr - (baseApr?.apr || 0),
      }
    } else {
      return item
    }
  })

  // Loading state
  if (loading) {
    return (
      <VStack spacing="6" w="full">
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 4, lg: 4 }}
          spacing={{ base: 'sm', md: 'md' }}
          w="full"
        >
          {[...Array(8)].map((_, i) => (
            <Skeleton height="65px" key={i} width="full" />
          ))}
        </SimpleGrid>
      </VStack>
    )
  }

  // Error state
  if (error) {
    return (
      <VStack align="flex-start" w="full">
        <Text color="red.400">Error loading reliquary stats</Text>
        <Text color="gray.400" fontSize="sm">
          {error.message}
        </Text>
      </VStack>
    )
  }

  return (
    <VStack spacing="6" w="full">
      <SimpleGrid columns={{ base: 2, sm: 3 }} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="TVL" />
          <StatValueText>{fNumCustom(tvl, '$0,0.00a')}</StatValueText>
        </RelicStat>
        <RelicStat>
          <HStack alignItems={'start'}>
            <StatLabel label="Incentives" />
            <InfoIconPopover message="Liquidity incentives are additional incentives which are available for maBEETS holders. The daily value is an approximation based on current token prices and emissions." />
          </HStack>
          <VStack align="flex-start" spacing="0">
            <StatValueText>~{fNumCustom(incentivesDailyValue, '$0,0.00a')}/day</StatValueText>
          </VStack>
        </RelicStat>
        <RelicStat>
          <StatLabel label="APR" />
          <HStack>
            <div className="apr-stripes">{getTotalAprLabel(dynamicDataAprItems)}</div>
            <MainAprTooltip
              aprItems={dynamicDataAprItems}
              chain={networkConfig.chain}
              onlySparkles
              pool={pool}
              poolId={pool.id}
            />
          </HStack>
        </RelicStat>
        <RelicStat>
          <HStack>
            <StatLabel label="Total Relics" />
          </HStack>
          <StatValueText>{fNumCustom(globalStats?.relicCount || 0, '0,0')}</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Level" />
          <StatValueText>{avgRelicMaturity}</StatValueText>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Value Per Relic" />
          <StatValueText>${fNum('fiat', avgValuePerRelic)}</StatValueText>
        </RelicStat>
      </SimpleGrid>

      <VStack spacing="6" w="full">
        <Box h={{ base: '450px' }} w="full">
          <ReliquaryDetailsCharts />
        </Box>
        <Box h={{ base: '450px' }} w="full">
          <ReliquaryCurveChart />
        </Box>
      </VStack>
    </VStack>
  )
}

'use client'

import { Flex, HStack, Link, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'
import { getTotalAprLabel } from '@repo/lib/modules/pool/pool.utils'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { fNum, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { zeroAddress } from 'viem'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'

type Props = {
  onToggleShowMore: () => void
  chartsVisible: boolean
}

export function MaBeetsNumbers({ onToggleShowMore, chartsVisible }: Props) {
  const { pool } = usePool()
  const { priceFor } = useTokens()
  const { latest: globalStats, loading } = useReliquaryGlobalStats()
  const networkConfig = useNetworkConfig()

  const data = pool.dynamicData

  const beetsPerDay = parseFloat(pool.staking?.reliquary?.beetsPerSecond || '0') * 86400
  const incentivesDailyValue =
    beetsPerDay * priceFor(networkConfig.tokens.addresses.beets || zeroAddress, networkConfig.chain)

  // Calculate relic maturity levels
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

  return (
    <VStack align="flex-start" flex="1" spacing="4" width="full">
      <Flex justify="space-between" width="full">
        <Text
          background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
          backgroundClip="text"
          fontSize="xl"
          fontWeight="bold"
        >
          maBeets Numbers
        </Text>
        <Link
          color="#05D690"
          cursor="pointer"
          onClick={onToggleShowMore}
          textDecoration="underline"
        >
          {chartsVisible ? 'Show less' : 'Show more'}
        </Link>
      </Flex>
      <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="APR" />
          <Skeleton isLoaded={!loading}>
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
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="TVL" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{fNumCustom(tvl, '$0,0.00a')}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <HStack alignItems={'start'}>
            <StatLabel label="Incentives" />
            <InfoIconPopover message="Liquidity incentives are additional incentives which are available for maBEETS holders. The daily value is an approximation based on current token prices and emissions." />
          </HStack>
          <Skeleton isLoaded={!loading} width="50%">
            <VStack align="flex-start" spacing="0">
              <StatValueText>~{fNumCustom(incentivesDailyValue, '$0,0.00a')}/day</StatValueText>
            </VStack>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Maturity Level" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{avgRelicMaturity}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <HStack>
            <StatLabel label="Total Relics" />
          </HStack>
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{fNumCustom(globalStats?.relicCount || 0, '0,0')}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Value Per Relic" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>${fNum('fiat', avgValuePerRelic)}</StatValueText>
          </Skeleton>
        </RelicStat>
      </SimpleGrid>
    </VStack>
  )
}

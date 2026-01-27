import { HStack, Link, SimpleGrid, Skeleton, Text, VStack } from '@chakra-ui/react'
import { InfoIconPopover } from '@repo/lib/modules/pool/actions/create/InfoIconPopover'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import MainAprTooltip from '@repo/lib/shared/components/tooltips/apr-tooltip/MainAprTooltip'
import { bn, fNumCustom } from '@repo/lib/shared/utils/numbers'
import { zeroAddress } from 'viem'
import { useReliquaryGlobalStats } from '../../hooks/useReliquaryGlobalStats'
import RelicStat, { StatLabel, StatValueText } from './RelicStat'
import { useReliquary } from '../../ReliquaryProvider'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

type Props = {
  onToggleShowMore: () => void
  chartsVisible: boolean
}

export function MaBeetsNumbers({ onToggleShowMore, chartsVisible }: Props) {
  const { pool } = usePool()
  const { priceFor } = useTokens()
  const { latest: globalStats, loading } = useReliquaryGlobalStats()
  const { chain } = useReliquary()
  const { toCurrency } = useCurrency()

  const networkConfig = getNetworkConfig(chain)
  const data = pool.dynamicData
  const beetsPerDay = bn(pool.staking?.reliquary?.beetsPerSecond || '0').times(86400)

  const incentivesDailyValue = bn(beetsPerDay).times(
    priceFor(networkConfig.tokens.addresses.beets || zeroAddress, networkConfig.chain)
  )

  const relicMaturityLevels = globalStats?.levelBalances.map((balance: any) => ({
    level: bn(balance.level).plus(1),
    percentageOfTotal: bn(balance.balance).div(globalStats.totalBalance),
  }))

  const avgRelicMaturity = fNumCustom(
    relicMaturityLevels?.reduce(
      (total: number, obj: any) => total + obj.level * obj.percentageOfTotal,
      0
    ) || 0,
    '0.00'
  )

  const reliquaryPoolRatio = bn(globalStats?.totalBalance || '').div(data.totalShares)
  const tvl = reliquaryPoolRatio.times(data.totalLiquidity)
  const avgValuePerRelic = tvl.div(globalStats?.relicCount || '')

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
      <Text
        background="linear-gradient(90deg, #CCFFCC 0%, #05D690 100%)"
        backgroundClip="text"
        fontSize="xl"
        fontWeight="bold"
      >
        maBeets Numbers
      </Text>
      <SimpleGrid columns={2} spacing={{ base: 'sm', md: 'md' }} w="full">
        <RelicStat>
          <StatLabel label="APR" />
          <Skeleton isLoaded={!loading}>
            <MainAprTooltip
              aprItems={dynamicDataAprItems}
              chain={networkConfig.chain}
              pool={pool}
              poolId={pool.id}
              textProps={{ fontWeight: '700' }}
            />
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="TVL" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{toCurrency(tvl)}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <HStack alignItems="start" h="full">
            <StatLabel label="Incentives" />
            <InfoIconPopover message="Liquidity incentives are additional incentives which are available for maBEETS holders. The daily value is an approximation based on current token prices and emissions." />
          </HStack>
          <Skeleton isLoaded={!loading} width="60%">
            <StatValueText>~{toCurrency(incentivesDailyValue)} per day</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Maturity Level" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{avgRelicMaturity}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Total Relics" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{fNumCustom(globalStats?.relicCount || 0, '0,0')}</StatValueText>
          </Skeleton>
        </RelicStat>
        <RelicStat>
          <StatLabel label="Avg Value Per Relic" />
          <Skeleton isLoaded={!loading} width="50%">
            <StatValueText>{toCurrency(avgValuePerRelic)}</StatValueText>
          </Skeleton>
        </RelicStat>
      </SimpleGrid>
      <Link
        color="font.highlight"
        cursor="pointer"
        ml="auto"
        onClick={onToggleShowMore}
        textDecoration="underline"
      >
        {chartsVisible ? 'Show less' : 'Show more'}
      </Link>
    </VStack>
  )
}

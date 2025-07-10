import { useLbpPoolCharts } from '@repo/lib/modules/pool/LbpDetail/LbpPoolCharts/LbpPoolChartsProvider'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { VStack, Text, Heading } from '@chakra-ui/react'
import { useMemo } from 'react'
import { PoolChartTab } from '@repo/lib/modules/pool/PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import { getNowTimestampInSecs } from '@repo/lib/shared/utils/time'
import { format, differenceInDays, secondsToMilliseconds, isBefore } from 'date-fns'

export function VolTvlFeesInfo({ chartType }: { chartType: PoolChartTab }) {
  const { hourlyData } = useLbpPoolCharts()
  const { toCurrency } = useCurrency()

  const { totalVolume, totalFees, latestTVL, latestTVLTimestamp, daysFromStart } = useMemo(() => {
    if (!hourlyData || !hourlyData.length) {
      return { totalVolume: 0, totalFees: 0, latestTVL: 0, latestTVLTimestamp: 0, daysFromStart: 0 }
    }

    const volume = hourlyData.reduce((sum, item) => sum + (item.volume || 0), 0)
    const fees = hourlyData.reduce((sum, item) => sum + (item.fees || 0), 0)

    // Find the most recent data point before now
    const now = getNowTimestampInSecs()
    let latestTVL = 0
    let latestTVLTimestamp = 0
    for (let i = hourlyData.length - 1; i >= 0; i--) {
      if (hourlyData[i].timestamp <= now) {
        latestTVL = hourlyData[i].tvl
        latestTVLTimestamp = hourlyData[i].timestamp
        break
      }
    }

    const firstDataPoint = hourlyData[0]?.timestamp
    const lastDataPoint = hourlyData[hourlyData.length - 1]?.timestamp
    const isLastDataPointBeforeNow = isBefore(new Date(lastDataPoint), new Date(now))

    const daysFromStart = firstDataPoint
      ? differenceInDays(
          isLastDataPointBeforeNow
            ? new Date(secondsToMilliseconds(lastDataPoint))
            : new Date(secondsToMilliseconds(now)),
          new Date(secondsToMilliseconds(firstDataPoint))
        )
      : 0

    return {
      totalVolume: volume,
      totalFees: fees,
      latestTVL,
      latestTVLTimestamp,
      daysFromStart,
    }
  }, [hourlyData])

  return (
    <VStack
      alignItems={{ base: undefined, md: 'flex-end' }}
      ml={{ base: undefined, md: 'auto' }}
      spacing="0"
    >
      {chartType === PoolChartTab.VOLUME && (
        <>
          <Heading fontWeight="bold" size="h5">
            {toCurrency(totalVolume)}
          </Heading>
          <Text color="grayText" fontSize="sm">
            {daysFromStart}d
          </Text>
        </>
      )}
      {chartType === PoolChartTab.FEES && (
        <>
          <Heading fontWeight="bold" size="h5">
            {toCurrency(totalFees)}
          </Heading>
          <Text color="grayText" fontSize="sm">
            {daysFromStart}d
          </Text>
        </>
      )}
      {chartType === PoolChartTab.TVL && (
        <>
          <Heading fontWeight="bold" size="h5">
            {toCurrency(latestTVL)}
          </Heading>
          <Text color="grayText" fontSize="sm">
            {format(new Date(secondsToMilliseconds(latestTVLTimestamp)), 'dd/MM/yyyy')}
          </Text>
        </>
      )}
    </VStack>
  )
}

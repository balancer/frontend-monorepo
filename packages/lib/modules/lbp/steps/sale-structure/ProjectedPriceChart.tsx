import { addHours, differenceInDays, format, isAfter, isBefore } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { buildMarkline, LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { Stack, Text } from '@chakra-ui/react'
import { LbpPrice } from '../../pool/usePriceInfo'

type Props = {
  startDate: Date
  endDate: Date
  onPriceChange?: (prices: LbpPrice[]) => void
  prices: LbpPrice[]
  cutTime?: Date
}

export function ProjectedPriceChart({ startDate, endDate, onPriceChange, prices, cutTime }: Props) {
  const priceData = dividePrices(prices, cutTime)

  setTimeout(() => {
    if (onPriceChange) onPriceChange(prices)
  })

  const priceRange = range(prices.map(item => item.projectTokenPrice))

  const chartInfo: EChartsOption = {
    grid: {
      top: '10%',
      bottom: '10%',
    },
    xAxis: {
      show: true,
      type: 'value',
      axisLine: { show: false },
      splitLine: { show: false },
      axisTick: { show: false },
      min: startDate.getTime(),
      max: endDate.getTime(),
      interval: 24 * 60 * 60 * 1000,
      axisLabel: {
        formatter: (value: number) => {
          const daysDiff = differenceInDays(new Date(value), startDate)
          return `Day ${daysDiff}`
        },
      },
    },
    yAxis: {
      show: true,
      type: 'value',
      axisLine: { show: false },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        formatter: (value: number) => {
          return `$${value}`
        },
      },
    },
    series: [
      buildMarkline('top-markline', startDate, endDate, priceRange.max),
      buildMarkline('middle-markline', startDate, endDate, priceRange.max / 2),
      buildMarkline('bottom-markline', startDate, endDate, 0),
      {
        id: 'launch-token-price',
        name: '',
        type: 'line' as const,
        data: priceData.data,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#B3AEF5' },
            { offset: 0.33, color: '#D7CBE7' },
            { offset: 0.66, color: '#E5C8C8' },
            { offset: 1, color: '#EAA879' },
          ]),
          width: 2,
          join: 'round' as const,
          cap: 'round' as const,
        },
        showSymbol: false,
      },
      {
        id: 'launch-token-price-after-cut-time',
        name: '',
        type: 'line' as const,
        data: priceData.dataAfterCutTime,
        lineStyle: {
          type: [2, 3],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#B3AEF5' },
            { offset: 0.33, color: '#D7CBE7' },
            { offset: 0.66, color: '#E5C8C8' },
            { offset: 1, color: '#EAA879' },
          ]),
          width: 2,
          join: 'round' as const,
          cap: 'round' as const,
        },
        showSymbol: false,
      },
    ],
  }

  if (cutTime && isAfter(cutTime, startDate) && isBefore(cutTime, endDate)) {
    chartInfo.series.push({
      id: 'cut-time',
      type: 'line',
      data: [
        [cutTime, 0],
        [cutTime, priceRange.max * 1.05],
      ],
      lineStyle: {
        color: 'grey',
        type: 'dashed',
        width: 1,
        cap: 'round' as const,
        join: 'round' as const,
      },
      label: {
        show: true,
        position: 'right',
        formatter: (value: LabelFormatterParams) => {
          if (value.data[1] === priceRange.max * 1.05) {
            const percentage =
              (cutTime.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())
            return `{progressFormat|${fNum('priceImpact', percentage)} complete}\n{dateFormat|${format(cutTime, 'h:mmaaa, dd/MM/yyyy')}}`
          } else return ''
        },
        backgroundColor: '#57616f',
        padding: 3,
        borderRadius: 2,
        shadowColor: '#1A000000',
        shadowBlur: 2,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        rich: {
          progressFormat: {
            color: '#25E2A4',
            fontWeight: 'bold',
            padding: 2,
          },
          dateFormat: {
            color: '#A0AEC0',
            padding: 2,
          },
        },
      },
      showSymbol: true,
    })
  }

  return prices.length > 0 ? (
    <ReactECharts option={chartInfo} style={{ height: '280px', width: '100%' }} />
  ) : (
    <Stack alignItems="center" h="350px" justifyContent="center">
      <Text fontSize="3xl">Missing data</Text>
    </Stack>
  )
}

export function interpolatePrices(
  startWeight: number,
  endWeight: number,
  startDate: Date,
  endDate: Date,
  launchTokenSeed: number,
  collateralTokenSeed: number,
  collateralTokenPrice: number
): LbpPrice[] {
  const startTimestamp = bn(startDate.getTime())
  const endTimestamp = bn(endDate.getTime())
  const slope = bn(endWeight).minus(startWeight).div(endTimestamp.minus(startTimestamp))
  const interpolateLaunchTokenWeight = (timestamp: BigNumber) =>
    bn(startWeight)
      .plus(slope.times(timestamp.minus(startTimestamp)))
      .toNumber()

  const interpolatePrice = (timestamp: BigNumber) => {
    const launchTokenWeight = interpolateLaunchTokenWeight(timestamp)
    const collateralTokenWeight = 100 - launchTokenWeight
    const spotPrice = bn(collateralTokenSeed)
      .div(collateralTokenWeight)
      .div(bn(launchTokenSeed).div(launchTokenWeight))

    return spotPrice.times(collateralTokenPrice).toNumber()
  }

  const data = []

  let currentPoint = startDate
  while (addHours(currentPoint, 1) < endDate) {
    const currentTimestamp = bn(currentPoint.getTime())
    data.push({ timestamp: currentPoint, projectTokenPrice: interpolatePrice(currentTimestamp) })
    currentPoint = addHours(currentPoint, 1)
  }

  data.push({ timestamp: endDate, projectTokenPrice: interpolatePrice(endTimestamp) })

  return data
}

function range(values: number[]) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

function dividePrices(
  prices: LbpPrice[],
  cutTime: Date | undefined
): { data: number[][]; dataAfterCutTime: number[][] } {
  const data: number[][] = []
  const dataAfterCutTime: number[][] = []

  prices.forEach(price => {
    if (cutTime && isBefore(price.timestamp, cutTime)) {
      data.push([price.timestamp.getTime(), price.projectTokenPrice])
    } else {
      dataAfterCutTime.push([price.timestamp.getTime(), price.projectTokenPrice])
    }
  })

  return { data, dataAfterCutTime }
}

import { addHours, differenceInDays, format, isAfter, isBefore, isValid } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { buildMarkline, LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { Stack, Text } from '@chakra-ui/react'

type Props = {
  startWeight: number
  endWeight: number
  startDate: Date
  endDate: Date
  launchTokenSeed: number
  collateralTokenSeed: number
  collateralTokenPrice: number
  onPriceChange: (prices: number[][]) => void
  cutTime?: Date
}

export function ProjectedPriceChart({
  startWeight,
  endWeight,
  startDate,
  endDate,
  launchTokenSeed,
  collateralTokenSeed,
  collateralTokenPrice,
  onPriceChange,
  cutTime,
}: Props) {
  const priceData = interpolateData(
    startWeight,
    endWeight,
    startDate,
    endDate,
    launchTokenSeed,
    collateralTokenSeed,
    collateralTokenPrice
  )

  setTimeout(() => onPriceChange(priceData))

  const priceRange = range(priceData.map(point => point[1]))

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
        data: priceData,
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
        data: priceData,
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

  const enoughData =
    startWeight &&
    endWeight &&
    isValid(startDate) &&
    isValid(endDate) &&
    launchTokenSeed &&
    collateralTokenSeed

  return enoughData ? (
    <ReactECharts option={chartInfo} style={{ height: '280px', width: '100%' }} />
  ) : (
    <Stack h="350px" alignItems="center" justifyContent="center">
      <Text fontSize="3xl">Missing data</Text>
    </Stack>
  )
}

function interpolateData(
  startWeight: number,
  endWeight: number,
  startDate: Date,
  endDate: Date,
  launchTokenSeed: number,
  collateralTokenSeed: number,
  collateralTokenPrice: number
) {
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
    data.push([currentPoint.getTime(), interpolatePrice(currentTimestamp)])
    currentPoint = addHours(currentPoint, 1)
  }

  data.push([endDate.getTime(), interpolatePrice(endTimestamp)])

  return data
}

function range(values: number[]) {
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

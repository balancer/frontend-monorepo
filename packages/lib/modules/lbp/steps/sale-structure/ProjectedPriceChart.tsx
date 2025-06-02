import { addHours, differenceInDays } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn } from '@repo/lib/shared/utils/numbers'
import { buildMarkline } from '@repo/lib/shared/utils/chart.helper'

export function ProjectedPriceChart({
  startWeight,
  endWeight,
  startDate,
  endDate,
  launchTokenSeed,
  collateralTokenSeed,
  collateralTokenPrice,
  onPriceChange,
}: {
  startWeight: number
  endWeight: number
  startDate: Date
  endDate: Date
  launchTokenSeed: number
  collateralTokenSeed: number
  collateralTokenPrice: number
  onPriceChange: (prices: number[][]) => void
}) {
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

  return <ReactECharts option={chartInfo} style={{ height: '350px', width: '100%' }} />
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

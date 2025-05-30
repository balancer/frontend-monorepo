import { addHours, differenceInDays } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn } from '@repo/lib/shared/utils/numbers'

export function WeightsChart({
  startWeight,
  endWeight,
  startDate,
  endDate,
}: {
  startWeight: number
  endWeight: number
  startDate: Date
  endDate: Date
}) {
  const launchTokenData = interpolateData(startWeight, endWeight, startDate, endDate)
  const collateralTokenData = invertData(launchTokenData)

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
      min: 0,
      max: 100,
      interval: 1,
      axisLabel: {
        formatter: (value: number) => {
          if (value === 100 - startWeight) return `{collateral|${value}%}`
          if (value === startWeight) return `{launch|${value}%}`

          return [0, 50, 100].includes(value) ? `${value}%` : [25, 75].includes(value) ? '-' : ''
        },
        rich: {
          launch: {
            backgroundColor: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: '#B3AEF5' },
              { offset: 0.33, color: '#D7CBE7' },
              { offset: 0.66, color: '#E5C8C8' },
              { offset: 1, color: '#EAA879' },
            ]),
            color: 'black',
            padding: 2,
            borderRadius: 2,
          },
          collateral: {
            backgroundColor: '#93C6FF',
            color: 'black',
            padding: 2,
            borderRadius: 2,
          },
        },
      },
    },
    series: [
      {
        id: 'top-markline',
        type: 'line',
        data: [
          [startDate, startWeight],
          [endDate, startWeight],
        ],
        lineStyle: {
          color: 'grey',
          type: 'dashed',
          width: 1,
          cap: 'round' as const,
          join: 'round' as const,
        },
        showSymbol: false,
      },
      {
        id: 'bottom-markline',
        type: 'line',
        data: [
          [startDate, 100 - startWeight],
          [endDate, 100 - startWeight],
        ],
        lineStyle: {
          color: 'grey',
          type: 'dashed',
          width: 1,
          cap: 'round' as const,
          join: 'round' as const,
        },
        showSymbol: false,
      },
      {
        id: 'collateral-token-weight',
        name: '',
        type: 'line' as const,
        data: collateralTokenData,
        lineStyle: {
          color: '#93C6FF',
          width: 3,
          join: 'round' as const,
          cap: 'round' as const,
        },
        showSymbol: false,
      },
      {
        id: 'launch-token-weight',
        name: '',
        type: 'line' as const,
        data: launchTokenData,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#B3AEF5' },
            { offset: 0.33, color: '#D7CBE7' },
            { offset: 0.66, color: '#E5C8C8' },
            { offset: 1, color: '#EAA879' },
          ]),
          width: 3,
          join: 'round' as const,
          cap: 'round' as const,
        },
        showSymbol: false,
      },
    ],
  }

  return (
    <ReactECharts
      onChartReady={() => {}}
      option={chartInfo}
      style={{ height: '350px', width: '100%' }}
    />
  )
}

function interpolateData(startWeight: number, endWeight: number, startDate: Date, endDate: Date) {
  const startTimestamp = bn(startDate.getTime())
  const endTimestamp = bn(endDate.getTime())
  const slope = bn(endWeight).minus(startWeight).div(endTimestamp.minus(startTimestamp))
  const interpolate = (timestamp: BigNumber) =>
    bn(startWeight)
      .plus(slope.times(timestamp.minus(startTimestamp)))
      .toNumber()

  const data = []

  let currentPoint = startDate
  while (addHours(currentPoint, 1) < endDate) {
    const currentTimestamp = bn(currentPoint.getTime())
    data.push([currentPoint.getTime(), interpolate(currentTimestamp)])
    currentPoint = addHours(currentPoint, 1)
  }

  data.push([endDate.getTime(), interpolate(endTimestamp)])

  return data
}

function invertData(data: number[][]) {
  return data.map(point => [point[0], 100 - (point[1] as number)])
}

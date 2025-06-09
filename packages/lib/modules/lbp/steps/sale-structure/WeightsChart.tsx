import {
  addHours,
  differenceInDays,
  format,
  hoursToMilliseconds,
  isAfter,
  isBefore,
  isValid,
} from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn } from '@repo/lib/shared/utils/numbers'
import { buildMarkline, LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { Stack, Text } from '@chakra-ui/react'

export function WeightsChart({
  startWeight,
  endWeight,
  startDate,
  endDate,
  cutTime,
}: {
  startWeight: number
  endWeight: number
  startDate: Date
  endDate: Date
  cutTime?: Date
}) {
  const { data: launchTokenData, dataAfterCutTime: launchTokenDataAfterCutTime } = interpolateData(
    startWeight,
    endWeight,
    startDate,
    endDate,
    cutTime
  )
  const collateralTokenData = invertData(launchTokenData)
  const collateralTokenDataAfterCutTime = invertData(launchTokenDataAfterCutTime)

  const chartInfo: EChartsOption = {
    grid: {
      top: '5%',
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
      interval: hoursToMilliseconds(24),
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
      min: -1,
      max: 101,
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
      buildMarkline('top-markline', startDate, endDate, startWeight),
      buildMarkline('bottom-markline', startDate, endDate, 100 - startWeight),
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
        id: 'collateral-token-weight-after-cut-time',
        name: '',
        type: 'line' as const,
        data: collateralTokenDataAfterCutTime,
        lineStyle: {
          type: [3, 4],
          color: '#93C6FF',
          width: 2,
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
      {
        id: 'launch-token-weight-after-cut-time',
        name: '',
        type: 'line' as const,
        data: launchTokenDataAfterCutTime,
        lineStyle: {
          type: [3, 4],
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
        [cutTime, 100],
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
          if (value.data[1] === 100)
            return `{labelFormat|${format(cutTime, 'h:mmaaa, dd/MM/yyyy')}}`
          else return ''
        },
        rich: {
          labelFormat: {
            backgroundColor: '#3F4650',
            color: '#A0AEC0',
            padding: 4,
            borderRadius: 2,
          },
        },
      },
      showSymbol: true,
    })
  }

  const enoughData = startWeight && endWeight && isValid(startDate) && isValid(endDate)

  return enoughData ? (
    <ReactECharts option={chartInfo} style={{ height: '350px', width: '100%' }} />
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
  cutTime?: Date
) {
  const startTimestamp = bn(startDate.getTime())
  const endTimestamp = bn(endDate.getTime())
  const slope = bn(endWeight).minus(startWeight).div(endTimestamp.minus(startTimestamp))
  const interpolate = (timestamp: BigNumber) =>
    bn(startWeight)
      .plus(slope.times(timestamp.minus(startTimestamp)))
      .toNumber()

  const data = []
  const dataAfterCutTime = []

  let currentPoint = startDate
  while (addHours(currentPoint, 1) < endDate) {
    const currentTimestamp = bn(currentPoint.getTime())
    if (!cutTime || isBefore(currentPoint, cutTime)) {
      data.push([currentPoint.getTime(), interpolate(currentTimestamp)])
    } else {
      dataAfterCutTime.push([currentPoint.getTime(), interpolate(currentTimestamp)])
    }
    currentPoint = addHours(currentPoint, 1)
  }

  if (!cutTime || isBefore(currentPoint, cutTime)) {
    data.push([endDate.getTime(), interpolate(endTimestamp)])
  } else {
    dataAfterCutTime.push([endDate.getTime(), interpolate(endTimestamp)])
  }

  return { data, dataAfterCutTime }
}

function invertData(data: number[][]) {
  return data.map(point => [point[0], 100 - (point[1] as number)])
}

import { addHours, differenceInDays, format, isAfter, isBefore, isValid } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn } from '@repo/lib/shared/utils/numbers'
import { LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { Stack, Text } from '@chakra-ui/react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'

export function WeightsChart({
  startWeight,
  endWeight,
  startDate,
  endDate,
  cutTime,
  launchTokenSymbol,
  collateralTokenSymbol,
}: {
  startWeight: number
  endWeight: number
  startDate: Date
  endDate: Date
  cutTime?: Date
  launchTokenSymbol: string
  collateralTokenSymbol: string
}) {
  const { isMobile } = useBreakpoints()
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
      containLabel: isMobile ? true : false,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''

        const timestamp = params[0].data[0]
        const date = new Date(timestamp)
        const formattedDate = format(date, 'MMM dd, yyyy h:mm a')

        // Find the launch token weight (original data)
        const launchWeight = params.find(
          (p: any) =>
            p.seriesId === 'launch-token-weight' ||
            p.seriesId === 'launch-token-weight-after-cut-time'
        )?.data[1]
        const collateralWeight = launchWeight ? 100 - launchWeight : null

        if (launchWeight !== undefined && collateralWeight !== null) {
          return `
            <div style="padding: 8px; background: #2D3748; border-radius: 4px; color: white; font-size: 12px;">
              <div style="margin-bottom: 4px; font-weight: bold;">${formattedDate}</div>
              <div style="display: flex; align-items: center; margin-bottom: 2px;">
                <div style="width: 12px; height: 12px; background: linear-gradient(45deg, #B3AEF5, #EAA879); border-radius: 2px; margin-right: 6px;"></div>
                ${launchTokenSymbol}: ${bn(launchWeight).toFixed(1)}%
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: #93C6FF; border-radius: 2px; margin-right: 6px;"></div>
                ${collateralTokenSymbol}: ${bn(collateralWeight).toFixed(1)}%
              </div>
            </div>
          `
        }

        return ''
      },
    },

    xAxis: {
      show: true,
      type: 'time',
      axisLine: { show: false },
      splitLine: { show: false },
      axisTick: { show: false },
      min: startDate.getTime(),
      max: endDate.getTime(),
      axisLabel: {
        formatter: (value: number) => {
          const totalDays = differenceInDays(endDate, startDate)
          const date = new Date(value)

          // Dynamic formatting based on date range
          if (totalDays <= 7) {
            // 5-7 days: Show "Apr 9" for each day
            return format(date, 'MMM d')
          } else if (totalDays <= 30) {
            // 1-4 weeks: Show "Apr 9" with auto spacing
            return format(date, 'MMM d')
          } else if (totalDays <= 90) {
            // 1-3 months: Show "Apr 9" with wider spacing
            return format(date, 'MMM d')
          } else if (totalDays <= 365) {
            // 3-12 months: Show "Apr" for months
            return format(date, 'MMM')
          } else {
            // > 1 year: Show "2024-04" for year-month
            return format(date, 'yyyy-MM')
          }
        },
        interval: 'auto', // ECharts automatically prevents overlap
        rotate: isMobile ? 45 : 0, // Rotate labels on mobile
        fontSize: isMobile ? 10 : 12,
        margin: 8,
      },
      splitNumber: (() => {
        const totalDays = differenceInDays(endDate, startDate)
        if (totalDays <= 7) return Math.min(totalDays, 7)
        if (totalDays <= 30) return 5
        if (totalDays <= 90) return 6
        if (totalDays <= 365) return 8
        return 10
      })(),
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
      {
        id: 'collateral-token-weight',
        name: '',
        type: 'line',
        data: collateralTokenData,
        lineStyle: {
          color: '#93C6FF',
          width: 3,
          join: 'round',
          cap: 'round',
        },
        showSymbol: false,
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: startWeight }, { yAxis: 100 - startWeight }],
          lineStyle: {
            type: 'dashed',
            color: 'grey',
            width: 1,
          },
          label: {
            show: false,
          },
        },
      },
      {
        id: 'collateral-token-weight-after-cut-time',
        name: '',
        type: 'line',
        data: collateralTokenDataAfterCutTime,
        lineStyle: {
          type: [3, 4],
          color: '#93C6FF',
          width: 2,
          join: 'round',
          cap: 'round',
        },
        showSymbol: false,
      },
      {
        id: 'launch-token-weight',
        name: '',
        type: 'line',
        data: launchTokenData,
        lineStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
            { offset: 0, color: '#B3AEF5' },
            { offset: 0.33, color: '#D7CBE7' },
            { offset: 0.66, color: '#E5C8C8' },
            { offset: 1, color: '#EAA879' },
          ]),
          width: 3,
          join: 'round',
          cap: 'round',
        },
        showSymbol: false,
      },
      {
        id: 'launch-token-weight-after-cut-time',
        name: '',
        type: 'line',
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
          join: 'round',
          cap: 'round',
        },
        showSymbol: false,
      },
    ],
  }

  if (cutTime && isAfter(cutTime, startDate) && isBefore(cutTime, endDate)) {
    const percentage =
      (cutTime.getTime() - startDate.getTime()) / (endDate.getTime() - startDate.getTime())

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
        cap: 'round',
        join: 'round',
      },
      label: {
        show: true,
        position: percentage < 0.8 ? 'right' : 'left',
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
    <Stack alignItems="center" h="350px" justifyContent="center">
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

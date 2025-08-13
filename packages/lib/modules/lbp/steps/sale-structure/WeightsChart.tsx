import { addHours, differenceInDays, format, isAfter, isBefore, isValid } from 'date-fns'
import { formatDateAxisLabel } from './chart-helpers'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { bn } from '@repo/lib/shared/utils/numbers'
import { LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { Stack, Text, useTheme } from '@chakra-ui/react'
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
  const theme = useTheme()

  const { data: launchTokenData, dataAfterCutTime: launchTokenDataAfterCutTime } = interpolateData(
    startWeight,
    endWeight,
    startDate,
    endDate,
    cutTime
  )
  const collateralTokenData = invertData(launchTokenData)
  const collateralTokenDataAfterCutTime = invertData(launchTokenDataAfterCutTime)

  const toolTipTheme = {
    heading: 'font-weight: bold; color: #E5D3BE',
    container: `background: ${theme.colors.gray[800]};`,
    text: theme.colors.gray[400],
  }

  const chartInfo: EChartsOption = {
    grid: {
      top: '5%',
      bottom: '10%',
      containLabel: isMobile ? true : false,
    },
    tooltip: {
      show: true,
      showContent: true,
      trigger: 'axis',
      confine: true,
      axisPointer: {
        animation: false,
        type: 'shadow',
        label: {
          show: false,
        },
      },
      extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
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
            <div style="width: 180px; padding: 8px; display: flex; flex-direction: column; justify-content: center;${toolTipTheme.container}">
              <div style="font-size: 0.85rem; font-weight: 500; color: ${toolTipTheme.text}; margin-bottom: 8px;">
                ${formattedDate}
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 12px; height: 12px; background: linear-gradient(45deg, #B3AEF5, #EAA879); border-radius: 2px; margin-right: 8px;"></div>
                <span style="font-size: 0.95rem; color: ${toolTipTheme.text};">${launchTokenSymbol}: ${bn(launchWeight).toFixed(1)}%</span>
              </div>
              <div style="display: flex; align-items: center;">
                <div style="width: 12px; height: 12px; background: #93C6FF; border-radius: 2px; margin-right: 8px;"></div>
                <span style="font-size: 0.95rem; color: ${toolTipTheme.text};">${collateralTokenSymbol}: ${bn(collateralWeight).toFixed(1)}%</span>
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
        formatter: (value: number) => formatDateAxisLabel(value, startDate, endDate),
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
      <Text color="font.secondary" fontStyle="italic" textAlign="center" w="55%">
        Enter a valid token contract and set the time period to see the chart.
      </Text>
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

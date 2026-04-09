import {
  Divider,
  Heading,
  HStack,
  Skeleton,
  Stack,
  Text,
  useTheme as useChakraTheme,
  VStack,
} from '@chakra-ui/react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { differenceInDays, format, isAfter, isBefore } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import { useTheme as useNextTheme } from 'next-themes'
import { useMemo } from 'react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { formatDateAxisLabel } from '@repo/lib/modules/lbp/steps/sale-structure/helpers'
import { LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import * as echarts from 'echarts/core'
import { range } from './chart.helper'
import { useLbpPoolCharts } from './LbpPoolChartsProvider'

export function LbpFundsRaisedChart() {
  const {
    snapshots,
    isLoading,
    startDateTime,
    endDateTime,
    reserveTokenSymbol,
    salePeriodText,
    fundsRaisedGoal,
    isSaleOngoing,
    currentFundsRaised,
    currentFundsRaisedPercentage,
  } = useLbpPoolCharts()
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()
  const { isMobile } = useBreakpoints()

  const colorMode = nextTheme === 'dark' ? '_dark' : 'default'
  const now = new Date()

  const chartData = useMemo(() => {
    const now = new Date()
    return snapshots
      .filter(snapshot => snapshot.timestamp <= now)
      .map(snapshot => [snapshot.timestamp.getTime(), snapshot.reserveTokenBalance])
  }, [snapshots])

  const reserveRange = range(snapshots.map(item => item.reserveTokenBalance))
  const yMax = fundsRaisedGoal || reserveRange.max
  const cutTimeYMax = yMax * 1.05

  const chartInfo: EChartsOption = {
    grid: {
      left: '0%',
      right: '4%',
      top: '10%',
      bottom: '10%',
      containLabel: isMobile,
    },
    graphic: {
      type: 'text',
      left: '0%',
      top: '4%',
      style: {
        text: reserveTokenSymbol,
        fill: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.8,
        fontSize: 12,
        fontWeight: 600,
      },
    },
    tooltip: {
      show: false,
    },
    xAxis: {
      show: true,
      type: 'time',
      axisLine: { show: false },
      splitLine: { show: false },
      axisTick: { show: false },
      min: startDateTime.getTime(),
      max: endDateTime.getTime(),
      axisLabel: {
        formatter: (value: number) => formatDateAxisLabel(value, startDateTime, endDateTime),
        interval: 'auto',
        rotate: isMobile ? 45 : 0,
        fontSize: isMobile ? 10 : 12,
        margin: 8,
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
      },
      splitNumber: (() => {
        const totalDays = differenceInDays(endDateTime, startDateTime)

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
      max: cutTimeYMax,
      axisLabel: {
        formatter: (value: number) => {
          if (Math.abs(value - cutTimeYMax) < 0.000001) return ''

          return `${fNum('token', value)}`
        },
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
      },
    },
    series: [
      {
        id: 'funds-raised',
        name: '',
        type: 'line',
        data: chartData,
        lineStyle: {
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
        markLine: {
          silent: true,
          symbol: 'none',
          data: [{ yAxis: 0 }, { yAxis: yMax / 2 }, { yAxis: yMax }],
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
    ],
  }

  if (isAfter(now, startDateTime) && isBefore(now, endDateTime)) {
    const percentage =
      (now.getTime() - startDateTime.getTime()) / (endDateTime.getTime() - startDateTime.getTime())

    chartInfo.series?.push({
      id: 'cut-time',
      type: 'line',
      z: 10,
      zlevel: 1,
      data: [
        [now, 0],
        [now, cutTimeYMax],
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
          if (value.data[1] === cutTimeYMax) {
            return isSaleOngoing && fundsRaisedGoal && currentFundsRaisedPercentage !== null
              ? `{green|${fNum('percentage', bn(currentFundsRaisedPercentage).div(100).toNumber())} complete}\n{time|${format(now, 'h:mma, MM/dd/yy')}}`
              : `{value|${fNum('token', currentFundsRaised)} ${reserveTokenSymbol}}\n{time|${format(now, 'h:mma, MM/dd/yy')}}`
          }

          return ''
        },
        backgroundColor: '#57616f',
        padding: 3,
        borderRadius: 2,
        shadowColor: '#1A000000',
        shadowBlur: 2,
        shadowOffsetX: 1,
        shadowOffsetY: 1,
        rich: {
          green: {
            color: '#25E2A4',
            fontWeight: 'bold',
            padding: 2,
          },
          value: {
            color: theme.semanticTokens.colors.font.primary[colorMode],
            fontWeight: 'bold',
            padding: 2,
          },
          time: {
            color: '#A0AEC0',
            padding: 2,
          },
        },
      },
      showSymbol: true,
    })
  }

  return isLoading ? (
    <Skeleton h="full" w="full" />
  ) : snapshots.length > 0 ? (
    <VStack h="full">
      <ReactECharts option={chartInfo} style={{ height: '100%', width: '100%' }} />
      <Divider />
      <HStack justify="end" mt="2" w="full">
        <Text color="font.secondary" fontSize="sm" ml={{ base: 0, md: 'auto' }}>
          {salePeriodText}
        </Text>
      </HStack>
    </VStack>
  ) : (
    <Stack alignItems="center" h="full" justifyContent="center">
      <Text fontSize="3xl">Missing data</Text>
    </Stack>
  )
}

export function FundsRaisedInfo() {
  const {
    currentFundsRaised,
    currentFundsRaisedUsd,
    reserveTokenSymbol,
    hasSnapshots,
    fundsRaisedGoal,
    currentFundsRaisedPercentage,
    isSaleOngoing,
  } = useLbpPoolCharts()

  const progressLabel =
    hasSnapshots && isSaleOngoing && fundsRaisedGoal && currentFundsRaisedPercentage !== null
      ? `${fNum('percentage', bn(currentFundsRaisedPercentage).div(100).toNumber())} of ${fNum(
          'token',
          fundsRaisedGoal,
          {
            abbreviated: false,
          }
        )} ${reserveTokenSymbol} goal`
      : null

  return (
    <VStack alignItems="end" spacing="0.5">
      <Heading fontWeight="bold" size="h5">
        {hasSnapshots
          ? `${fNum('token', currentFundsRaised, { abbreviated: false })} ${reserveTokenSymbol}`
          : '—'}
      </Heading>
      <Text color="font.secondary" fontSize="12px">
        {hasSnapshots ? (progressLabel ?? `${toUsdLabel(currentFundsRaisedUsd)}`) : 'No data'}
      </Text>
    </VStack>
  )
}

function toUsdLabel(value: number) {
  return `$${fNum('fiat', value, { abbreviated: false })}`
}

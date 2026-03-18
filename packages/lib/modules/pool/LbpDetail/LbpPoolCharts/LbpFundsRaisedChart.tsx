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
import { differenceInDays, format } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import { useTheme as useNextTheme } from 'next-themes'
import { useMemo } from 'react'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { formatDateAxisLabel } from '@repo/lib/modules/lbp/steps/sale-structure/helpers'
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
  } = useLbpPoolCharts()
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()
  const { isMobile } = useBreakpoints()

  const colorMode = nextTheme === 'dark' ? '_dark' : 'default'

  const chartData = useMemo(
    () => snapshots.map(snapshot => [snapshot.timestamp.getTime(), snapshot.reserveTokenBalance]),
    [snapshots]
  )

  const reserveRange = range(snapshots.map(item => item.reserveTokenBalance))

  const chartInfo: EChartsOption = {
    grid: {
      left: '7.5%',
      right: '4%',
      top: '10%',
      bottom: '10%',
      containLabel: isMobile,
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
      extraCssText: `padding-right:2rem;border: none;background: ${theme.colors.gray[800]};`,
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''

        const timestamp = params[0].data[0]
        const fundsRaised = params[0].data[1]
        const progressLabel =
          isSaleOngoing && fundsRaisedGoal
            ? `<div style="font-size: 0.95rem; font-weight: 600; color: #68D391; margin-top: 4px;">${fNum(
                'percentage',
                bn(fundsRaised).div(fundsRaisedGoal).toNumber()
              )} complete</div>`
            : ''

        return `
  <div style="width: 170px; padding: 8px; display: flex; flex-direction: column; justify-content: center; background: ${theme.colors.gray[800]};">
      ${progressLabel}
      <div style="font-size: 0.85rem; font-weight: 500; color: ${theme.colors.gray[400]}; margin-bottom: 4px;">
        ${format(new Date(timestamp), 'MMM dd, yyyy h:mm a')}
      </div>
    </div>
  `
      },
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
      axisLabel: {
        formatter: (value: number) => `${fNum('token', value)} ${reserveTokenSymbol}`,
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
          data: [{ yAxis: reserveRange.max }, { yAxis: reserveRange.max / 2 }],
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

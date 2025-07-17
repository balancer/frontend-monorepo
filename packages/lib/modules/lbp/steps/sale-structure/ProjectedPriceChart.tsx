import { differenceInDays, format, isAfter, isBefore } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { fNum } from '@repo/lib/shared/utils/numbers'
import { LabelFormatterParams } from '@repo/lib/shared/utils/chart.helper'
import { LbpPrice } from '../../pool/usePriceInfo'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Skeleton, Stack, Text, useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { dividePrices, range } from '@repo/lib/modules/pool/LbpDetail/LbpPoolCharts/chart.helper'

type Props = {
  startDate: Date
  endDate: Date
  onPriceChange?: (prices: LbpPrice[]) => void
  prices: LbpPrice[]
  cutTime?: Date
  isLoading?: boolean
  gridLeft?: string
}

export function ProjectedPriceChart({
  startDate,
  endDate,
  onPriceChange,
  prices,
  cutTime,
  isLoading,
  gridLeft,
}: Props) {
  const { toCurrency } = useCurrency()
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()
  const { isMobile } = useBreakpoints()

  const colorMode = nextTheme === 'dark' ? '_dark' : 'default'
  const priceData = dividePrices(prices, cutTime)

  setTimeout(() => {
    if (onPriceChange) onPriceChange(prices)
  })

  const priceRange = range(prices.map(item => item.projectTokenPrice))

  const chartInfo: EChartsOption = {
    grid: {
      left: gridLeft || '10%',
      right: '4%',
      top: '10%',
      bottom: '10%',
      containLabel: isMobile,
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''

        const timestamp = params[0].data[0]
        const price = params[0].data[1]
        const date = new Date(timestamp)
        const formattedDate = format(date, 'MMM dd, yyyy h:mm a')
        const formattedPrice = toCurrency(price)

        return `
          <div style="padding: 8px; background: #2D3748; border-radius: 4px; color: white; font-size: 12px;">
            <div style="margin-bottom: 4px; font-weight: bold;">${formattedDate}</div>
            <div style="display: flex; align-items: center;">
              <div style="width: 12px; height: 12px; background: linear-gradient(45deg, #B3AEF5, #EAA879); border-radius: 2px; margin-right: 6px;"></div>
              Price: ${formattedPrice}
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
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
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
      axisLabel: {
        formatter: (value: number) => {
          return toCurrency(value)
        },
        color: theme.semanticTokens.colors.font.primary[colorMode],
        opacity: 0.5,
      },
    },
    series: [
      {
        id: 'launch-token-price',
        name: '',
        type: 'line',
        data: prices.map(item => [item.timestamp, item.projectTokenPrice]),
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
          data: [
            { yAxis: priceRange.max },
            { yAxis: 0 },
            {
              yAxis: priceRange.max / 2,
            },
          ],
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
        id: 'launch-token-price-after-cut-time',
        name: '',
        type: 'line',
        data: priceData.dataAfterCutTime,
        lineStyle: {
          type: [2, 3],
          width: 2,
          color: 'rgb(63, 70, 80)', //TODO: update for light theme
        },
        symbol: 'none',
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
        [cutTime, priceRange.max * 1.05],
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
          if (value.data[1] === priceRange.max * 1.05) {
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

  return isLoading ? (
    <Skeleton h="280px" w="full" />
  ) : prices.length > 0 ? (
    <ReactECharts option={chartInfo} style={{ height: '280px', width: '100%' }} />
  ) : (
    <Stack alignItems="center" h="280px" justifyContent="center">
      <Text fontSize="3xl">Missing data</Text>
    </Stack>
  )
}

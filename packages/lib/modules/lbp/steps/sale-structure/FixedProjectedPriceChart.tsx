import { differenceInDays, format } from 'date-fns'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import { formatDateAxisLabel } from './helpers'
import { LbpPrice } from '../../pool/usePriceInfo'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { Skeleton, Stack, Text, useTheme as useChakraTheme } from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import * as echarts from 'echarts/core'

type Props = {
  startDateTime: Date
  endDateTime: Date
  prices: LbpPrice[]
  isLoading?: boolean
  gridLeft?: string
}

export function FixedProjectedPriceChart({
  startDateTime,
  endDateTime,
  prices,
  isLoading,
  gridLeft,
}: Props) {
  const { toCurrency } = useCurrency()
  const theme = useChakraTheme()
  const { theme: nextTheme } = useNextTheme()
  const { isMobile } = useBreakpoints()

  const colorMode = nextTheme === 'dark' ? '_dark' : 'default'
  const priceValue = prices[0]?.projectTokenPrice ?? 0
  const yAxisMin = priceValue ? priceValue * 0.9 : 0
  const yAxisMax = priceValue ? priceValue * 1.1 : 1

  const toolTipTheme = {
    container: `background: ${theme.colors.gray[800]};`,
    text: theme.colors.gray[400],
  }

  const chartInfo: EChartsOption = {
    grid: {
      left: gridLeft || '10%',
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
      extraCssText: `padding-right:2rem;border: none;${toolTipTheme.container}`,
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''

        const timestamp = params[0].data[0]
        const price = params[0].data[1]
        const date = new Date(timestamp)
        const formattedDate = format(date, 'MMM dd, yyyy h:mm a')
        const formattedPrice = toCurrency(price)

        return `
  <div style="width: 150px; padding: 8px; display: flex; flex-direction: column; justify-content: center;${toolTipTheme.container}">
      <div style="font-size: 0.85rem; font-weight: 500; color: ${toolTipTheme.text}; margin-bottom: 4px;">
        ${formattedDate}
      </div>
      <div style="font-size: 0.95rem; font-weight: 500; color: ${toolTipTheme.text};">
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
      min: yAxisMin,
      max: yAxisMax,
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
      },
    ],
  }

  return isLoading ? (
    <Skeleton h="full" w="full" />
  ) : prices.length > 0 ? (
    <ReactECharts option={chartInfo} style={{ height: '100%', width: '100%' }} />
  ) : (
    <Stack alignItems="center" h="full" justifyContent="center">
      <Text fontSize="3xl">Missing data</Text>
    </Stack>
  )
}

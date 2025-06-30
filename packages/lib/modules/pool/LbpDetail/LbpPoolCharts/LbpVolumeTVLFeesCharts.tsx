/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import ReactECharts from 'echarts-for-react'
import { LbpPrice, HourlyDataPoint } from '@repo/lib/modules/lbp/pool/usePriceInfo'
import { PoolChartTab } from '../../PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import {
  getDefaultPoolChartOptions,
  PoolChartTypeOptions,
} from '@repo/lib/modules/pool/PoolDetail/PoolStats/PoolCharts/PoolChartsProvider'
import {
  ColorMode,
  Skeleton,
  Stack,
  Text,
  theme as defaultTheme,
  useTheme as useChakraTheme,
} from '@chakra-ui/react'
import { useTheme as useNextTheme } from 'next-themes'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'
import { useMemo } from 'react'

interface Props {
  chartType: PoolChartTab
  hourlyData: HourlyDataPoint[]
  isLoading?: boolean
  prices: LbpPrice[]
}

type SupportedPoolChartTab = PoolChartTab.VOLUME | PoolChartTab.TVL | PoolChartTab.FEES

export function LbpVolumeTVLFeesCharts({
  chartType,
  hourlyData = [],
  isLoading = false,
  prices = [],
}: Props) {
  const theme = useChakraTheme()
  const { toCurrency } = useCurrency()
  const { theme: nextTheme } = useNextTheme()

  const poolChartTypeOptions: Record<SupportedPoolChartTab, PoolChartTypeOptions> = {
    [PoolChartTab.VOLUME]: {
      type: 'bar',
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          {
            offset: 0,
            color: theme.semanticTokens.colors.chart.pool.bar.volume.from,
          },
          {
            offset: 1,
            color: theme.semanticTokens.colors.chart.pool.bar.volume.to,
          },
        ],
      },
      hoverColor: defaultTheme.colors.pink[500],
    },
    [PoolChartTab.TVL]: {
      type: 'line',
      color: defaultTheme.colors.blue[600],
      hoverBorderColor: defaultTheme.colors.pink[500],
      hoverColor: defaultTheme.colors.gray[900],
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(14, 165, 233, 0.08)',
            },
            {
              offset: 1,
              color: 'rgba(68, 9, 236, 0)',
            },
          ],
        },
      },
    },
    [PoolChartTab.FEES]: {
      type: 'bar',
      color: defaultTheme.colors.yellow[400],
      hoverColor: defaultTheme.colors.pink[500],
    },
  }

  const getChartData = (): Array<[number, number]> => {
    if ((!hourlyData || !hourlyData.length) && chartType !== PoolChartTab.PRICE) {
      return []
    }

    switch (chartType) {
      case PoolChartTab.VOLUME:
        return hourlyData.map(item => [item.timestamp, item.volume])
      case PoolChartTab.FEES:
        return hourlyData.map(item => [item.timestamp, item.fees])
      case PoolChartTab.TVL:
      default:
        return hourlyData.map(item => [item.timestamp, item.tvl])
    }
  }

  const chartData = getChartData()
  const defaultChartOptions = getDefaultPoolChartOptions(toCurrency, nextTheme as ColorMode, theme)

  const option = useMemo(() => {
    const activeTabOptions = poolChartTypeOptions[chartType as SupportedPoolChartTab] || {
      type: 'line',
      color: defaultTheme.colors.blue[500],
      hoverColor: defaultTheme.colors.pink[500],
    }

    return {
      ...defaultChartOptions,
      series: [
        {
          type: activeTabOptions.type,
          data: chartData,
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2,
          },
          itemStyle: {
            color: activeTabOptions.color,
            borderRadius: 100,
          },
          emphasis: {
            itemStyle: {
              color: activeTabOptions.hoverColor,
              borderColor: activeTabOptions.hoverBorderColor,
            },
          },
          areaStyle: activeTabOptions.areaStyle,
          animationEasing: function (k: number) {
            return k === 1 ? 1 : 1 - Math.pow(2, -10 * k)
          },
        },
      ],
    }
  }, [chartType, chartData, defaultChartOptions])

  const hasData = React.useMemo(() => {
    return chartType === PoolChartTab.PRICE
      ? prices.length > 0
      : (hourlyData?.length ?? 0) > 0 && chartData.length > 0
  }, [chartType, prices.length, hourlyData, chartData.length])

  if (isLoading) {
    return <Skeleton h="280px" w="full" />
  }

  if (!hasData) {
    return (
      <Stack alignItems="center" h="280px" justifyContent="center">
        <Text color="font.secondary" fontSize="lg">
          No {chartType.replace('LBP_', '').toLowerCase()} data available
        </Text>
      </Stack>
    )
  }

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <ReactECharts
        option={option}
        opts={{ renderer: 'canvas' }}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  )
}

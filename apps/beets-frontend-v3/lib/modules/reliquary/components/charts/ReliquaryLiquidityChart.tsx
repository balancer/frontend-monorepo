import { useChakraContext } from '@chakra-ui/react'
/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useTheme: Use Import from theme or use useChakraContext

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { EChartsOption, graphic } from 'echarts'
import { format } from 'date-fns'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

interface Props {
  data: { timestamp: number; totalLiquidity: string }[]
}

export function ReliquaryLiquidityChart({ data }: Props) {
  const theme = useChakraContext()

  const chartData = useMemo(
    () => data.map(item => [item.timestamp * 1000, item.totalLiquidity]),
    [data]
  )

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      textStyle: {
        color: '#D3D3D3',
      },
      legend: {
        show: false,
        data: ['TVL'],
        textStyle: {
          color: theme.token('colors.base'),
        },
        top: '0',
        right: '2%',
      },
      grid: {
        bottom: '2%',
        right: '1.5%',
        left: '1.5%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        minorSplitLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: (value: number) => {
            return format(new Date(value), 'MMM d')
          },
          color: theme.token('colors.gray'),
          interval: 'auto',

          showMaxLabel: false,
          showMinLabel: false,
        },
        //maxInterval: 3600 * 1000 * 24,
        axisPointer: {
          type: 'line',
          label: {
            formatter: params => {
              return format(new Date(params.value), 'MMM d')
            },
          },
        },
        axisLine: { show: false },
      },
      yAxis: [
        {
          type: 'value',
          axisLine: { show: false },
          minorSplitLine: { show: false },
          splitLine: { show: false },
          axisLabel: {
            formatter: function (value: number, index: number) {
              return index % 3 === 1 ? `$${fNumCustom(value, '0a')}` : ''
            },
            color: theme.token('colors.base'),
          },
          axisPointer: {
            label: {
              formatter: function (params) {
                const value = typeof params.value === 'number' ? params.value : Number(params.value)
                return `$${fNumCustom(value, '0a')}`
              },
            },
          },
        },
      ],
      series: [
        {
          data: chartData,
          name: 'TVL',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              if (value == null) return '$0'
              const numValue = Array.isArray(value) ? value[0] : value
              if (numValue == null || numValue instanceof Date) return '$0'
              return `$${fNumCustom(numValue, '0a')}`
            },
          },
          itemStyle: {
            opacity: 1,
            borderRadius: [5, 5, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: theme.token('semanticTokens.colors.chart.pool.bar.volume.from') },
              {
                offset: 0.5,
                color: theme.token('semanticTokens.colors.chart.pool.bar.volume.from'),
              },
              { offset: 1, color: theme.token('semanticTokens.colors.chart.pool.bar.volume.to') },
            ]),
          },
        },
      ],
    }),
    [chartData, theme]
  )

  return <ReactECharts option={option} style={{ height: '100%' }} />
}

import { useMemo } from 'react'
import { EChartsOption, graphic } from 'echarts'
import { format } from 'date-fns'
import { fNum } from '@repo/lib/shared/utils/numbers'
import ReactECharts from 'echarts-for-react'
import { useTheme as useChakraTheme } from '@chakra-ui/react'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'

interface Props {
  data: { timestamp: number; relicCount: string }[]
}

export function ReliquaryRelicsCountChart({ data }: Props) {
  const theme = useChakraTheme()

  const chartData = useMemo(
    () => data.map(item => [item.timestamp * 1000, parseInt(item.relicCount)]),
    [data]
  )

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        type: 'shadow',
        backgroundColor: theme.colors.base['700'],
        borderColor: 'transparent',
        borderRadius: 8,
        textStyle: {
          color: 'white',
        },
        padding: 16,
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: theme.colors.base['100'],
            width: 2,
            opacity: 1,
          },
        },
        // any -> https://github.com/apache/echarts/issues/14277
        formatter: (params: any) => `# of relics: ${fNumCustom(params[0].data[1], '0a')}`,
      },
      textStyle: {
        color: '#D3D3D3',
      },
      xAxis: {
        show: true,
        type: 'time',
        offset: 0,
        minorSplitLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          formatter: (value: number, index: number) => {
            return index % 2 === 0 ? format(new Date(value), 'MMM d') : ''
          },
          color: theme.colors.gray['200'],
          showMaxLabel: false,
          showMinLabel: false,
        },
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
      yAxis: {
        show: false,
        scale: true,
        splitLine: { show: false },
        offset: 0,
      },
      grid: {
        left: 0,
        right: 0,
        top: '5%',
        bottom: '7.5%',
        containLabel: false,
      },
      series: [
        {
          type: 'line',
          smooth: true,
          name: 'Relics',
          showSymbol: false,
          data: chartData,
          itemStyle: {
            color: theme.semanticTokens.colors.chart.pool.bar.volume.from,
          },
          areaStyle: {
            opacity: 0.2,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: theme.semanticTokens.colors.chart.pool.bar.volume.from },
              { offset: 0.5, color: theme.semanticTokens.colors.chart.pool.bar.volume.from },
              { offset: 1, color: theme.semanticTokens.colors.chart.pool.bar.volume.to },
            ]),
          },
          axisLine: { show: false },
          minorSplitLine: { show: false },
          splitLine: { show: false },

          tooltip: {
            valueFormatter: value => fNum('fiat', value as number),
          },
        },
      ],
    }),
    [chartData, theme]
  )

  return <ReactECharts option={option} style={{ height: '100%' }} />
}

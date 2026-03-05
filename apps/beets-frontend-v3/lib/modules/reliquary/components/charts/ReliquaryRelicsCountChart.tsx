import { useChakraContext } from '@chakra-ui/react'
/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useTheme: Use Import from theme or use useChakraContext

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import { useMemo } from 'react';
import { EChartsOption, graphic } from 'echarts'
import { format } from 'date-fns'
import { bn, fNumCustom } from '@repo/lib/shared/utils/numbers'
import ReactECharts from 'echarts-for-react'
import { secondsToMilliseconds } from 'date-fns'

interface Props {
  data: { timestamp: number; relicCount: string }[]
}

export function ReliquaryRelicsCountChart({ data }: Props) {
  const theme = useChakraContext()

  const chartData = useMemo(
    () => data.map(item => [secondsToMilliseconds(item.timestamp), bn(item.relicCount).toNumber()]),
    [data]
  )

  const option = useMemo<EChartsOption>(
    () => ({
      tooltip: {
        trigger: 'axis',
        type: 'shadow',
        backgroundColor: theme.token('colors.base'),
        borderColor: 'transparent',
        borderRadius: 8,
        textStyle: {
          color: 'white' },
        padding: 16,
        axisPointer: {
          animation: false,
          type: 'cross',
          lineStyle: {
            color: theme.token('colors.base'),
            width: 2,
            opacity: 1 } },
        // any -> https://github.com/apache/echarts/issues/14277
        formatter: (params: any) => `# of Relics: ${fNumCustom(params[0].data[1], '0a')}` },
      textStyle: {
        color: theme.token('colors.gray') },
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
          color: theme.token('colors.gray'),
          showMaxLabel: false,
          showMinLabel: false },
        axisPointer: {
          type: 'line',
          label: {
            formatter: params => {
              return format(new Date(params.value), 'MMM d')
            } } },
        axisLine: { show: false } },
      yAxis: {
        show: false,
        scale: true,
        splitLine: { show: false },
        offset: 0 },
      grid: {
        left: 0,
        right: 0,
        top: '5%',
        bottom: '7.5%',
        containLabel: false },
      series: [
        {
          type: 'line',
          smooth: true,
          name: 'Relics',
          showSymbol: false,
          data: chartData,
          itemStyle: {
            color: theme.token('semanticTokens.colors.chart.pool.bar.volume.from') },
          areaStyle: {
            opacity: 0.2,
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: theme.token('semanticTokens.colors.chart.pool.bar.volume.from') },
              { offset: 0.5, color: theme.token('semanticTokens.colors.chart.pool.bar.volume.from') },
              { offset: 1, color: theme.token('semanticTokens.colors.chart.pool.bar.volume.to') },
            ]) },
          axisLine: { show: false },
          minorSplitLine: { show: false },
          splitLine: { show: false },

          tooltip: {
            valueFormatter: value => fNumCustom(value as number, '0a') } },
      ] }),
    [chartData, theme]
  )

  return <ReactECharts option={option} style={{ height: '100%' }} />
}

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { EChartsOption, graphic } from 'echarts'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'

export function ReliquaryMaturityChart() {
  const { pool } = usePool()

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
        // any -> https://github.com/apache/echarts/issues/14277
        formatter: (params: any) =>
          `Level ${params[0].data[0]}: ${fNumCustom(params[0].data[1], '0a')} fBEETS`,
      },
      textStyle: {
        color: '#D3D3D3',
      },
      xAxis: {
        name: 'Level',
        nameLocation: 'middle',
        nameGap: 35,
        type: 'category',
        splitLine: { show: false },
        axisTick: { show: false, alignWithLabel: true },
        interval: 1,
        axisLabel: {
          margin: 16,
        },
        axisLine: { show: false },
      },
      yAxis: {
        name: 'fBEETS',
        nameLocation: 'middle',
        nameRotate: 90,
        type: 'value',
        axisLine: { show: false },
        minorSplitLine: { show: false },
        splitLine: { show: false },
        axisLabel: {
          show: false,
        },
        axisTick: { show: false },
      },
      grid: {
        bottom: '5.5%',
        right: '1.5%',
        left: '4.5%',
        top: '10%',
        containLabel: true,
      },
      series: [
        {
          data: pool.staking?.reliquary?.levels?.map(level => [level.level + 1, level.balance]),
          type: 'bar',
          itemStyle: {
            opacity: 1,
            borderRadius: [5, 5, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `rgba(5, 214, 144, 1)` },
              { offset: 0.5, color: `rgba(5, 214, 144, 0.7)` },
              { offset: 1, color: `rgba(5, 214, 144, 0)` },
            ]),
          },
        },
      ],
    }),
    [JSON.stringify(pool.staking?.reliquary?.levels)]
  )

  return <ReactECharts option={option} style={{ height: '100%' }} />
}

import { useTheme } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { EChartsOption, graphic } from 'echarts'
import numeral from 'numeral'
import { chartGetPrimaryColor } from '~/modules/pool/detail/components/charts/chart-util'
import { useNetworkConfig } from '@repo/lib/config/useNetworkConfig'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'

export function ReliquaryMaBEETSLevelChart() {
  const { pool } = usePool()
  const { colors } = useTheme()
  const networkConfig = useNetworkConfig()

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
          `Level ${params[0].data[0]}: ${numeral(params[0].data[1]).format('0a')} maBEETS`,
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
          color: colors.gray['200'],
          margin: 16,
        },
        axisLine: { show: false },
      },
      yAxis: {
        name: 'maBEETS',
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
          data: pool.staking?.reliquary?.levels?.map(level => [
            level.level + 1,
            parseFloat(level.balance) * level.allocationPoints,
          ]),
          type: 'bar',
          itemStyle: {
            opacity: 1,
            borderRadius: [5, 5, 0, 0],
            color: new graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: chartGetPrimaryColor(networkConfig.chainId, 1) },
              { offset: 0.5, color: chartGetPrimaryColor(networkConfig.chainId, 0.7) },
              { offset: 1, color: chartGetPrimaryColor(networkConfig.chainId, 0) },
            ]),
          },
        },
      ],
    }),
    [JSON.stringify(pool.staking?.reliquary?.levels)]
  )

  return <ReactECharts option={option} style={{ height: '100%' }} />
}

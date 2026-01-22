'use client'

import { Box, HStack, Link, useTheme, VStack } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { EChartsOption, graphic } from 'echarts'
import ReactECharts from 'echarts-for-react'
import { ExternalLink } from 'react-feather'
import { InfoButton } from '~/components/info-button/InfoButton'

export function ReliquaryCurveChart() {
  const { pool } = usePool()
  const theme = useTheme()

  const data = pool.staking?.reliquary?.levels
    ?.map(level => ({
      level: level.level + 1,
      allocationPoints: level.allocationPoints,
    }))
    // sometimes the levels from the pool data loop around which gives a weird chart, so just always slice out the correct data
    .slice(0, 11)

  const option: EChartsOption = {
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
        `Level ${params[0].data[0]}: ${fNumCustom(params[0].data[1], '0a')}x maturity boost`,
      confine: true,
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
      axisLabel: {
        margin: 16,
      },
      axisLine: { show: false },
    },
    yAxis: {
      name: 'Maturity boost',
      nameLocation: 'middle',
      nameRotate: 90,
      type: 'value',
      axisLine: { show: false },
      splitLine: { show: false },
      axisLabel: {
        show: false,
      },
      axisTick: { show: false },
    },
    grid: {
      bottom: '6.5%',
      right: '1.5%',
      left: '6.5%',
      top: '10%',
      containLabel: true,
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: data?.map(item => [item.level, item.allocationPoints]),
        areaStyle: {
          opacity: 0.2,
          color: new graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: theme.semanticTokens.colors.chart.pool.bar.volume.from },
            { offset: 0.5, color: theme.semanticTokens.colors.chart.pool.bar.volume.from },
            { offset: 1, color: theme.semanticTokens.colors.chart.pool.bar.volume.to },
          ]),
        },
        lineStyle: {
          color: theme.semanticTokens.colors.chart.pool.bar.volume.from,
        },
      },
    ],
  }

  return (
    <VStack h="full" p={{ base: 'sm', md: 'md' }} w="full">
      <HStack w="full">
        <InfoButton
          infoText="This curve shows the maturity boost per level."
          label="BEETronix"
          labelProps={{
            lineHeight: '1rem',
            fontWeight: 'semibold',
            fontSize: 'sm',
            color: 'beets.base.50',
          }}
        />
        <Link href="https://docs.beets.fi/tokenomics/mabeets" isExternal>
          <ExternalLink size="16" />
        </Link>
      </HStack>
      <Box h="full" w="full">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      </Box>
    </VStack>
  )
}

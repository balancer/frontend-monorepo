'use client'
import { Box } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useEclpChart } from '../hooks/EclpChartProvider'

export function EclpChart() {
  const { options } = useEclpChart()

  return (
    <Box h="full" position="relative" w="full">
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
    </Box>
  )
}

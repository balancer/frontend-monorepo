'use client'
import { Box } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useEclpChart } from '../hooks/EclpChartProvider'
import { ReversedToggleButton } from '@repo/lib/shared/components/btns/ReversedToggleButton'

export function EclpChart() {
  const { options, toggleIsReversed } = useEclpChart()

  return (
    <Box h="full" position="relative" w="full">
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
      <ReversedToggleButton toggleIsReversed={toggleIsReversed} />
    </Box>
  )
}

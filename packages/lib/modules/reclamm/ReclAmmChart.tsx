import { ReversedToggleButton } from '@repo/lib/shared/components/btns/ReversedToggleButton'
import { Box } from '@chakra-ui/react'
import { useReclAmmChart } from './ReclAmmChartProvider'
import ReactECharts from 'echarts-for-react'

export function ReclAmmChart() {
  const { options, toggleIsReversed } = useReclAmmChart()

  return (
    <Box h="full" position="relative" w="full">
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
      <ReversedToggleButton toggleIsReversed={toggleIsReversed} />
    </Box>
  )
}

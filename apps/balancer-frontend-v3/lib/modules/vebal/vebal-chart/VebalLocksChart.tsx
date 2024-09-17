import { Stack } from '@chakra-ui/react'

import ReactECharts from 'echarts-for-react'
import { useVebalLocksChart } from './useVebalLocksChart'

export function VeBALLocksChart() {
  const { options } = useVebalLocksChart()

  return (
    <Stack h="full" height="300px" w="full">
      <ReactECharts onEvents={{}} option={options} style={{ height: '100%', width: '100%' }} />
    </Stack>
  )
}

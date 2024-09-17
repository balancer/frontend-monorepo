import { Stack } from '@chakra-ui/react'

import ReactECharts from 'echarts-for-react'
import { useVebalLocksChart } from './useVebalLocksChart'

export function VeBALLocksChart() {
  const { options } = useVebalLocksChart()

  return (
    <Stack w="full" h="full" height="300px">
      <ReactECharts style={{ height: '100%', width: '100%' }} option={options} onEvents={{}} />
    </Stack>
  )
}

import { Box } from '@chakra-ui/react'
import { useReclAmmChart } from './ReclAmmChartProvider'
import ReactECharts from 'echarts-for-react'
import { useRef, useEffect } from 'react'

export function ReclAmmChart() {
  const { options, setChartInstance } = useReclAmmChart()
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (chartRef.current && chartRef.current.getEchartsInstance) {
      const instance = chartRef.current.getEchartsInstance()
      if (instance) {
        setChartInstance(instance)
      }
    }
  }, [setChartInstance])

  return (
    <Box h="full" position="relative" w="full">
      <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
    </Box>
  )
}

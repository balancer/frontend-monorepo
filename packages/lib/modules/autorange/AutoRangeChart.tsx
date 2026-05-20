import { Box } from '@chakra-ui/react'
import { useAutoRangeChart } from './AutoRangeChartProvider'
import ReactECharts from 'echarts-for-react'
import { useRef, useEffect } from 'react'

export function AutoRangeChart() {
  const { options, setChartInstance } = useAutoRangeChart()
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
      <ReactECharts option={options} ref={chartRef} style={{ height: '100%', width: '100%' }} />
    </Box>
  )
}

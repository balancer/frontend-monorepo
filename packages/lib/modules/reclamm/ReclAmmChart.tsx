import { ReversedToggleButton } from '@repo/lib/shared/components/btns/ReversedToggleButton'
import { Box } from '@chakra-ui/react'
import { useReclAmmChart } from './ReclAmmChartProvider'
import ReactECharts from 'echarts-for-react'
import { useRef, useEffect } from 'react'

export function ReclAmmChart() {
  const { options, toggleIsReversed, setChartInstance } = useReclAmmChart()
  const chartRef = useRef<any>(null)

  // When the chart instance is available, store it in the context
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
      <ReactECharts
        className="reclamm-chart"
        option={options}
        ref={chartRef}
        style={{ height: '100%', width: '100%' }}
      />
      <ReversedToggleButton toggleIsReversed={toggleIsReversed} />
    </Box>
  )
}

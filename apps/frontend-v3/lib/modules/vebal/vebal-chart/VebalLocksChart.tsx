import { Card, CardProps } from '@chakra-ui/react'

import ReactECharts from 'echarts-for-react'
import { useVebalLocksChart } from './useVebalLocksChart'

export function VeBALLocksChart(props: CardProps) {
  const { options, onChartReady, onEvents } = useVebalLocksChart()

  return (
    <Card position="relative" {...props}>
      <ReactECharts
        onChartReady={onChartReady}
        style={{ height: '100%', width: '100%' }}
        option={options}
        onEvents={onEvents}
      />
    </Card>
  )
}

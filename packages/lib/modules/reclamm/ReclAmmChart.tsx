import { useReclAmmChart } from './useReclAmmChart'
import ReactECharts from 'echarts-for-react'

export function ReclAmmChart() {
  const { option } = useReclAmmChart()

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}

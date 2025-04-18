'use client'

import ReactECharts from 'echarts-for-react'
import { usePoolWeightShiftsChart } from './usePoolWeightShiftsChart'

export function PoolWeightShiftsChart() {
  const { option } = usePoolWeightShiftsChart()

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
}

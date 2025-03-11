'use client'

import { DefaultPoolCharts } from './DefaultPoolCharts'
import { EclpChart } from '../../../../eclp/components/EclpChart'
import { PoolChartTab, usePoolCharts } from './usePoolCharts'

export function PoolChartsContainer() {
  const poolChartsData = usePoolCharts()

  const isLiquidityProfileTab = poolChartsData.activeTab.value === PoolChartTab.LIQUIDITY_PROFILE

  return (
    <>
      {isLiquidityProfileTab ? (
        <EclpChart
          activeTab={poolChartsData.activeTab}
          setActiveTab={poolChartsData.setActiveTab}
          tabsList={poolChartsData.tabsList}
        />
      ) : (
        <DefaultPoolCharts {...poolChartsData} />
      )}
    </>
  )
}

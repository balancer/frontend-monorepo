'use client'

import { DefaultPoolCharts } from './DefaultPoolCharts'
import { EclpChart } from '../../../../eclp/components/EclpChart'
import { PoolChartTab, usePoolCharts } from './usePoolCharts'
import { BoxProps } from '@chakra-ui/react'

const COMMON_NOISY_CARD_PROPS: { contentProps: BoxProps; cardProps: BoxProps } = {
  contentProps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 'none',
    borderTopLeftRadius: 'none',
    borderBottomRightRadius: 'none',
  },
  cardProps: {
    position: 'relative',
    overflow: 'hidden',
    height: 'full',
  },
}

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
          {...COMMON_NOISY_CARD_PROPS}
        />
      ) : (
        <DefaultPoolCharts {...poolChartsData} {...COMMON_NOISY_CARD_PROPS} />
      )}
    </>
  )
}

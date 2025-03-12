'use client'

import { DefaultPoolCharts } from './DefaultPoolCharts'
import { EclpChart } from '../../../../eclp/components/EclpChart'
import { PoolChartTabsProvider, PoolChartTab, usePoolChartTabs } from './PoolChartTabsProvider'
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
  return (
    <PoolChartTabsProvider>
      <PoolChartsContent />
    </PoolChartTabsProvider>
  )
}

function PoolChartsContent() {
  const { activeTab } = usePoolChartTabs()

  const isLiquidityProfileTab = activeTab.value === PoolChartTab.LIQUIDITY_PROFILE

  return isLiquidityProfileTab ? (
    <EclpChart {...COMMON_NOISY_CARD_PROPS} />
  ) : (
    <DefaultPoolCharts {...COMMON_NOISY_CARD_PROPS} />
  )
}

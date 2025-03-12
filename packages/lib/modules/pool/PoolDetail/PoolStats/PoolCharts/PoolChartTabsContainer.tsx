import React from 'react'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { PoolChartTab, PoolChartTypeTab, usePoolChartTabs } from './PoolChartTabsProvider'
import { HStack } from '@chakra-ui/react'
import { PeriodSelect } from './PeriodSelect'

export function PoolChartTabsContainer({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, tabsList } = usePoolChartTabs()

  return (
    <>
      <HStack alignSelf="flex-start">
        <ButtonGroup
          currentOption={activeTab}
          groupId="chart"
          onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
          options={tabsList}
          size="xxs"
        />
        {activeTab.value !== PoolChartTab.LIQUIDITY_PROFILE && <PeriodSelect />}
      </HStack>
      {children}
    </>
  )
}

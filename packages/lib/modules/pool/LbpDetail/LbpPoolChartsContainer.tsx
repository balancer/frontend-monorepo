import { Card, HStack } from '@chakra-ui/react'
import {
  PoolChartTab,
  PoolChartTabsProvider,
  PoolChartTypeTab,
  usePoolChartTabs,
} from '../PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'

import { LbpPriceChart, PriceInfo } from './LbpPriceChart'
import { usePriceInfo } from '../../lbp/pool/usePriceInfo'
import { usePool } from '../PoolProvider'
import { Address } from 'viem'

export function LbpPoolChartsContainer() {
  return (
    <PoolChartTabsProvider>
      <PoolChartsContent />
    </PoolChartTabsProvider>
  )
}

function PoolChartsContent() {
  const { activeTab, setActiveTab, tabsList } = usePoolChartTabs()
  const { pool } = usePool()
  const { prices } = usePriceInfo(pool.chain, pool.id as Address)

  return (
    <Card h="420px">
      <HStack alignSelf="flex-start" justifyContent="space-between" w="full">
        <ButtonGroup
          currentOption={activeTab}
          groupId="chart"
          onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
          options={tabsList}
          size="xxs"
        />
        {activeTab.value === PoolChartTab.PRICE && <PriceInfo prices={prices} />}
      </HStack>
      {activeTab.value === PoolChartTab.PRICE && <LbpPriceChart />}
    </Card>
  )
}

import { Card, HStack, Spacer } from '@chakra-ui/react'
import {
  PoolChartTab,
  PoolChartTabsProvider,
  PoolChartTypeTab,
  usePoolChartTabs,
} from '../PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { PoolCharts } from '../PoolDetail/PoolStats/PoolCharts/PoolCharts'
import { PoolChartsProvider } from '../PoolDetail/PoolStats/PoolCharts/PoolChartsProvider'
import { PriceInfo } from '../PoolDetail/PoolStats/PoolCharts/LbpPriceChart'

export function LbpPoolChartsContainer() {
  return (
    <PoolChartTabsProvider>
      <PoolChartsProvider>
        <PoolChartsContent />
      </PoolChartsProvider>
    </PoolChartTabsProvider>
  )
}

function PoolChartsContent() {
  const { activeTab, setActiveTab, tabsList } = usePoolChartTabs()

  return (
    <Card h="full">
      <HStack alignSelf="flex-start" w="full">
        <ButtonGroup
          currentOption={activeTab}
          groupId="chart"
          onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
          options={tabsList}
          size="xxs"
        />

        {activeTab.value === PoolChartTab.PRICE && (
          <>
            <Spacer />
            <PriceInfo />
          </>
        )}
      </HStack>

      <PoolCharts key={`default-chart-${activeTab.value}`} />
    </Card>
  )
}

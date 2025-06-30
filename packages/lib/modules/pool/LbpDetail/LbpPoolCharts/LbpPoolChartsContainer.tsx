import { Card, HStack } from '@chakra-ui/react'
import {
  PoolChartTab,
  PoolChartTabsProvider,
  PoolChartTypeTab,
  usePoolChartTabs,
} from '../../PoolDetail/PoolStats/PoolCharts/PoolChartTabsProvider'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { LbpPriceChart, PriceInfo } from './LbpPriceChart'
import { LbpPoolChartsProvider, useLbpPoolCharts } from './LbpPoolChartsProvider'
import { LbpVolumeTVLFeesCharts } from './LbpVolumeTVLFeesCharts'

export function LbpPoolChartsContainer() {
  return (
    <PoolChartTabsProvider>
      <LbpPoolChartsProvider>
        <PoolChartsContent />
      </LbpPoolChartsProvider>
    </PoolChartTabsProvider>
  )
}

function PoolChartsContent() {
  const { activeTab, setActiveTab, tabsList } = usePoolChartTabs()
  const { hourlyData, hasHourlyData, isLoading } = useLbpPoolCharts()

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
        {activeTab.value === PoolChartTab.PRICE && <PriceInfo />}
      </HStack>
      {activeTab.value === PoolChartTab.PRICE ? (
        <LbpPriceChart />
      ) : (
        <LbpVolumeTVLFeesCharts
          chartType={activeTab.value}
          hasHourlyData={hasHourlyData}
          hourlyData={hourlyData}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}

import { Card, HStack, Box } from '@chakra-ui/react'
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
import { AnimatePresence, motion } from 'framer-motion'
import { VolTvlFeesInfo } from './VolTvlFeesInfo'

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
    <Card>
      <HStack align="start" h="full" justifyContent="space-between" w="full">
        <ButtonGroup
          currentOption={activeTab}
          groupId="chart"
          onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
          options={tabsList}
          size="xxs"
        />
        {activeTab.value === PoolChartTab.PRICE && <PriceInfo />}
        {activeTab.value !== PoolChartTab.PRICE && <VolTvlFeesInfo chartType={activeTab.value} />}
      </HStack>
      <Box
        h={activeTab.value === PoolChartTab.PRICE ? '325px' : '340px'}
        overflow="hidden"
        position="relative"
        w="full"
      >
        <AnimatePresence mode="wait">
          {activeTab.value === PoolChartTab.PRICE ? (
            <motion.div
              animate={{ x: '0%' }}
              exit={{ x: '-100%' }}
              initial={{ x: '100%' }}
              key={activeTab.value}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
              }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <LbpPriceChart />
            </motion.div>
          ) : (
            <LbpVolumeTVLFeesCharts
              chartType={activeTab.value}
              hasHourlyData={hasHourlyData}
              hourlyData={hourlyData}
              isLoading={isLoading}
            />
          )}
        </AnimatePresence>
      </Box>
    </Card>
  )
}

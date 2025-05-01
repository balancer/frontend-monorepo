'use client'

import {
  PoolChartTabsProvider,
  PoolChartTab,
  usePoolChartTabs,
  PoolChartTypeTab,
} from './PoolChartTabsProvider'
import {
  Box,
  BoxProps,
  Card,
  Flex,
  HStack,
  Skeleton,
  Stack,
  VStack,
  Text,
  Heading,
} from '@chakra-ui/react'
import { ClpBadge } from '@repo/lib/modules/eclp/components/ClpBadge'
import { EclpChartProvider, useEclpChart } from '@repo/lib/modules/eclp/hooks/EclpChartProvider'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { AnimatePresence, motion } from 'framer-motion'
import { PeriodSelect } from './PeriodSelect'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { PoolChartsProvider, usePoolCharts } from './PoolChartsProvider'
import { EclpChart } from '@repo/lib/modules/eclp/components/EclpChart'
import { PoolCharts } from './PoolCharts'
import {
  ReclAmmChartProvider,
  useReclAmmChart,
} from '@repo/lib/modules/reclamm/ReclAmmChartProvider'
import { ReclAmmChart } from '@repo/lib/modules/reclamm/ReclAmmChart'

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
      <PoolChartsProvider>
        <EclpChartProvider>
          <ReclAmmChartProvider>
            <PoolChartsContent />
          </ReclAmmChartProvider>
        </EclpChartProvider>
      </PoolChartsProvider>
    </PoolChartTabsProvider>
  )
}

function PoolChartsContent({ ...props }: any) {
  const { activeTab, setActiveTab, tabsList, getActiveTabLabel } = usePoolChartTabs()
  const {
    hasChartData: hasEclpChartData,
    isLoading: isLoadingEclpChartData,
    poolIsInRange,
  } = useEclpChart()

  const {
    hasChartData: hasReclAmmChartData,
    isLoading: isLoadingReclAmmChartData,
    isPoolWithinTargetRange,
  } = useReclAmmChart()

  const {
    hasChartData: hasPoolChartData,
    isLoading: isLoadingPoolChartsData,
    chartValueSum,
    activePeriod,
  } = usePoolCharts()

  const isLoading = isLoadingEclpChartData || isLoadingPoolChartsData || isLoadingReclAmmChartData
  const hasChartData = hasEclpChartData || hasPoolChartData || hasReclAmmChartData

  const showPoolCharts =
    activeTab.value !== PoolChartTab.RECLAMM && activeTab.value !== PoolChartTab.LIQUIDITY_PROFILE

  const showReclammChart = activeTab.value === PoolChartTab.RECLAMM
  const showLiquidityProfileChart = activeTab.value === PoolChartTab.LIQUIDITY_PROFILE

  return (
    <Card {...props}>
      <Stack h="full">
        {isLoading ? (
          <Skeleton h="full" minH="200px" w="full" />
        ) : hasChartData ? (
          <NoisyCard {...COMMON_NOISY_CARD_PROPS}>
            <VStack h="full" p={{ base: 'sm', md: 'md' }} w="full">
              <Stack direction={{ base: 'column', md: 'row' }} w="full">
                <HStack alignSelf="flex-start">
                  <ButtonGroup
                    currentOption={activeTab}
                    groupId="chart"
                    onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
                    options={tabsList}
                    size="xxs"
                  />
                  {showPoolCharts && <PeriodSelect />}
                </HStack>
                <VStack
                  alignItems={{ base: undefined, md: 'flex-end' }}
                  ml={{ base: undefined, md: 'auto' }}
                  spacing="0"
                >
                  {showLiquidityProfileChart || showReclammChart ? (
                    <ClpBadge poolIsInRange={poolIsInRange || isPoolWithinTargetRange} />
                  ) : (
                    <>
                      <Heading fontWeight="bold" size="h5">
                        {chartValueSum}
                      </Heading>
                      <Text color="grayText" fontSize="sm">
                        {getActiveTabLabel(activePeriod)}
                      </Text>
                    </>
                  )}
                </VStack>
              </Stack>
              <Box h={['300px', '400px', 'full']} overflow="hidden" position="relative" w="full">
                <AnimatePresence mode="wait">
                  {showLiquidityProfileChart && (
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
                      <EclpChart />
                    </motion.div>
                  )}
                  {showReclammChart && (
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
                      <ReclAmmChart />
                    </motion.div>
                  )}
                  {showPoolCharts && <PoolCharts key={`default-chart-${activeTab.value}`} />}
                </AnimatePresence>
              </Box>
            </VStack>
          </NoisyCard>
        ) : (
          <Flex align="center" h="full" justify="center" w="full">
            <Text fontSize="2xl" p="lg" variant="secondary">
              Not enough data
            </Text>
          </Flex>
        )}
      </Stack>
    </Card>
  )
}

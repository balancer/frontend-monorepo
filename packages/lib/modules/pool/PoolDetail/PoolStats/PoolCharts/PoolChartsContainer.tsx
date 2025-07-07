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
import { ClpBadge } from '@repo/lib/shared/components/badges/ClpBadge'
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
import { ThumbsDown, ThumbsUp } from 'react-feather'
import { WandIcon } from '@repo/lib/shared/components/icons/WandIcon'

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
    outOfRangeText: eclpOutOfRangeText,
    inRangeText: eclpInRangeText,
  } = useEclpChart()

  const {
    hasChartData: hasReclAmmChartData,
    isLoading: isLoadingReclAmmChartData,
    isPoolWithinTargetRange,
    outOfRangeText: reclammOutOfRangeText,
    inRangeText: reclammInRangeText,
    inRangeReadjustingText: reclammInRangeReadjustingText,
    isPoolWithinRange,
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

  const clpBadgeConfigs = {
    liquidityProfile: {
      bgColor: poolIsInRange ? 'green.400' : 'orange.300',
      bodyText: poolIsInRange ? eclpInRangeText : eclpOutOfRangeText,
      headerText: `CLP ${poolIsInRange ? 'in' : 'out of'} range`,
      icon: poolIsInRange ? ThumbsUp : ThumbsDown,
    },
    reclamm: {
      bgColor: isPoolWithinTargetRange ? 'green.400' : isPoolWithinRange ? 'orange.300' : 'red.400',
      bodyText: isPoolWithinTargetRange
        ? reclammInRangeText
        : isPoolWithinRange
          ? reclammInRangeReadjustingText
          : reclammOutOfRangeText,
      headerText: isPoolWithinTargetRange ? 'Pool in range' : 'Pool readjusting',
      icon: isPoolWithinTargetRange ? ThumbsUp : WandIcon,
    },
  }

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
                  {showLiquidityProfileChart && <ClpBadge {...clpBadgeConfigs.liquidityProfile} />}
                  {showReclammChart && <ClpBadge {...clpBadgeConfigs.reclamm} />}
                  {!showLiquidityProfileChart && !showReclammChart && (
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
              <Box
                h={[showReclammChart ? '500px' : '300px', '400px', 'full']}
                overflow="hidden"
                position="relative"
                w="full"
              >
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

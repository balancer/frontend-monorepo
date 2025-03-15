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
import { useEclpChart } from '@repo/lib/modules/eclp/hooks/useEclpChart'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { AnimatePresence, motion } from 'framer-motion'
import { PeriodSelect } from './PeriodSelect'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { usePoolCharts } from './usePoolCharts'
import { EclpChart } from '@repo/lib/modules/eclp/components/EclpChart'
import { PoolCharts } from './PoolCharts'

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

function PoolChartsContent({ ...props }: any) {
  const { activeTab, setActiveTab, tabsList, getActiveTabLabel } = usePoolChartTabs()
  const { hasChartData: hasEclpChartData, isLoading: isLoadingEclpChartData } = useEclpChart()

  const {
    hasChartData: hasPoolChartData,
    isLoading: isLoadingPoolChartsData,
    chartValueSum,
    activePeriod,
  } = usePoolCharts()

  const isLoading = isLoadingEclpChartData || isLoadingPoolChartsData
  const hasChartData = hasEclpChartData || hasPoolChartData

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
                  {activeTab.value !== PoolChartTab.LIQUIDITY_PROFILE && <PeriodSelect />}
                </HStack>
                <VStack
                  alignItems={{ base: undefined, md: 'flex-end' }}
                  ml={{ base: undefined, md: 'auto' }}
                  spacing="0"
                >
                  {activeTab.value === PoolChartTab.LIQUIDITY_PROFILE ? (
                    <ClpBadge />
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
                  {activeTab.value === PoolChartTab.LIQUIDITY_PROFILE ? (
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
                  ) : (
                    <PoolCharts key={`default-chart-${activeTab.value}`} />
                  )}
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

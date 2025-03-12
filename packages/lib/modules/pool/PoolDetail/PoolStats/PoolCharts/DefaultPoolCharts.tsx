'use client'
import {
  Box,
  BoxProps,
  Card,
  CardProps,
  Flex,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolChartTab, usePoolChartTabs } from './PoolChartTabsProvider'
import { usePoolCharts } from './usePoolCharts'
import { PoolChartTabsContainer } from './PoolChartTabsContainer'

type DefaultPoolChartsProps = CardProps & { cardProps: BoxProps; contentProps: BoxProps }

export function DefaultPoolCharts({ cardProps, contentProps, ...props }: DefaultPoolChartsProps) {
  const { activePeriod, isLoading, options, handleAxisMoved, chartValueSum, hasChartData } =
    usePoolCharts()

  const { activeTab } = usePoolChartTabs()

  function getActiveTabLabel() {
    switch (activeTab.value) {
      case PoolChartTab.TVL:
        return 'Total value locked'
      case PoolChartTab.FEES:
        return `${activePeriod.label} fees`
      case PoolChartTab.VOLUME:
        return `${activePeriod.label} volume`
    }
  }

  return (
    <Card {...props}>
      <Stack h="full">
        {isLoading ? (
          <Skeleton h="full" minH="200px" w="full" />
        ) : hasChartData ? (
          <NoisyCard cardProps={cardProps} contentProps={contentProps}>
            <VStack h="full" p={{ base: 'sm', md: 'md' }} w="full">
              <Stack direction={{ base: 'column', md: 'row' }} w="full">
                <PoolChartTabsContainer>
                  <VStack
                    alignItems={{ base: undefined, md: 'flex-end' }}
                    ml={{ base: undefined, md: 'auto' }}
                    spacing="0"
                  >
                    <Heading fontWeight="bold" size="h5">
                      {chartValueSum}
                    </Heading>
                    <Text color="grayText" fontSize="sm">
                      {getActiveTabLabel()}
                    </Text>
                  </VStack>
                </PoolChartTabsContainer>
              </Stack>
              <Box h="full" w="full">
                <ReactECharts
                  onEvents={{
                    updateAxisPointer: handleAxisMoved,
                  }}
                  option={options}
                  style={{ height: '100%', width: '100%' }}
                />
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

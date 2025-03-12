'use client'
import {
  Box,
  BoxProps,
  Card,
  CardProps,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { poolChartPeriods, PoolChartPeriod } from './usePoolCharts'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { GroupBase, OptionBase, Select, SingleValue } from 'chakra-react-select'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolChartTab, PoolChartTypeTab, usePoolChartTabs } from './PoolChartTabsProvider'
import { usePoolCharts } from './usePoolCharts'

type PeriodOption = PoolChartPeriod & OptionBase

type Props = {
  value: PeriodOption
  onChange(value: PeriodOption): void
}

export function PeriodSelect({ value, onChange }: Props) {
  const chakraStyles = getSelectStyles<PeriodOption>()

  function handleChange(newOption: SingleValue<PeriodOption>) {
    if (newOption) onChange(newOption)
  }

  return (
    <Select<PeriodOption, false, GroupBase<PeriodOption>>
      chakraStyles={chakraStyles}
      name="Chain"
      onChange={handleChange}
      options={poolChartPeriods}
      size="sm"
      value={value}
    />
  )
}

type DefaultPoolChartsProps = CardProps & { cardProps: BoxProps; contentProps: BoxProps }

export function DefaultPoolCharts({ cardProps, contentProps, ...props }: DefaultPoolChartsProps) {
  const {
    activePeriod,
    setActivePeriod,
    isLoading,
    options,
    handleAxisMoved,
    chartValueSum,
    hasChartData,
  } = usePoolCharts()

  const { activeTab, setActiveTab, tabsList } = usePoolChartTabs()

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
                <HStack alignSelf="flex-start">
                  <ButtonGroup
                    currentOption={activeTab}
                    groupId="chart"
                    onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
                    options={tabsList}
                    size="xxs"
                  />
                  {activeTab.value !== PoolChartTab.LIQUIDITY_PROFILE && (
                    <PeriodSelect onChange={setActivePeriod} value={activePeriod} />
                  )}
                </HStack>
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

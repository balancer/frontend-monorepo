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
import {
  PoolChartTab,
  PoolChartTypeTab,
  poolChartPeriods,
  PoolChartPeriod,
  PoolChartsData,
} from './usePoolCharts'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { GroupBase, OptionBase, Select, SingleValue } from 'chakra-react-select'
import { getSelectStyles } from '@repo/lib/shared/services/chakra/custom/chakra-react-select'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'

type PeriodOption = PoolChartPeriod & OptionBase

type Props = {
  value: PeriodOption
  onChange(value: PeriodOption): void
}

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

type DefaultPoolChartsProps = CardProps & PoolChartsData

export function DefaultPoolCharts({
  activeTab,
  setActiveTab,
  tabsList,
  activePeriod,
  setActivePeriod,
  isLoading,
  options,
  handleAxisMoved,
  handleMouseLeave,
  chartValueSum,
  hasChartData,
  ...props
}: DefaultPoolChartsProps) {
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
          <NoisyCard
            cardProps={COMMON_NOISY_CARD_PROPS.cardProps}
            contentProps={COMMON_NOISY_CARD_PROPS.contentProps}
          >
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
              <Box h="full" onMouseLeave={handleMouseLeave} w="full">
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

'use client'
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardProps,
  Flex,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { PoolChartTypeTab } from '../../pool/PoolDetail/PoolStats/PoolCharts/usePoolCharts'
import ButtonGroup from '@repo/lib/shared/components/btns/button-group/ButtonGroup'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ClpBadge } from './ClpBadge'
import { useEclpChart } from '../hooks/useEclpChart'
import { Repeat } from 'react-feather'

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

interface EclpChartProps extends CardProps {
  activeTab: PoolChartTypeTab
  setActiveTab: (tab: PoolChartTypeTab) => void
  tabsList: PoolChartTypeTab[]
}

export function EclpChart({ activeTab, setActiveTab, tabsList, ...props }: EclpChartProps) {
  const { hasChartData, poolIsInRange, isLoading, options, toggleIsReversed } = useEclpChart()

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
                    groupId="eclp-chart"
                    onChange={tab => setActiveTab(tab as PoolChartTypeTab)}
                    options={tabsList}
                    size="xxs"
                  />
                </HStack>
                <VStack
                  alignItems={{ base: undefined, md: 'flex-end' }}
                  ml={{ base: undefined, md: 'auto' }}
                  spacing="0"
                >
                  <ClpBadge poolIsInRange={poolIsInRange} />
                </VStack>
              </Stack>
              <Box h="full" position="relative" w="full">
                <ReactECharts option={options} style={{ height: '100%', width: '100%' }} />
                <Button
                  bottom={0}
                  fontSize="xs"
                  fontWeight="medium"
                  onClick={toggleIsReversed}
                  position="absolute"
                  px={2}
                  py={1}
                  right={2}
                  size="xs"
                  variant="primary"
                  zIndex={1}
                >
                  <Icon as={Repeat} />
                </Button>
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

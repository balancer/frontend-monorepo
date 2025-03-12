'use client'
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardProps,
  Flex,
  Icon,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { ClpBadge } from './ClpBadge'
import { useEclpChart } from '../hooks/useEclpChart'
import { PoolChartTabsContainer } from '../../pool/PoolDetail/PoolStats/PoolCharts/PoolChartTabsContainer'
import { Repeat } from 'react-feather'

interface EclpChartProps extends CardProps {
  cardProps: BoxProps
  contentProps: BoxProps
}

export function EclpChart({ cardProps, contentProps, ...props }: EclpChartProps) {
  const { hasChartData, poolIsInRange, isLoading, options, toggleIsReversed } = useEclpChart()

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
                    <ClpBadge poolIsInRange={poolIsInRange} />
                  </VStack>
                </PoolChartTabsContainer>
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

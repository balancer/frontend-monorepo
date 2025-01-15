'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import { Box, HStack, Text, VStack, useTheme } from '@chakra-ui/react'
import { useMemo, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import EChartsReactCore from 'echarts-for-react/lib/core'
import { motion } from 'framer-motion'
import { ChartSizeValues } from './PoolWeightChart'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { Pool } from '../../PoolProvider'
import { calcTotalStakedBalanceUsd, getUserWalletBalanceUsd } from '../../user-balance.helpers'

const smallSize: ChartSizeValues = {
  chartHeight: '125px',
  boxWidth: 125,
  boxHeight: 125,
  haloTop: '40%',
  haloLeft: '55px',
  haloWidth: '40px',
  haloHeight: '40px',
}

const normalSize: ChartSizeValues = {
  chartHeight: '225px',
  boxWidth: 225,
  boxHeight: 225,
  haloTop: '49%',
  haloLeft: '95px',
  haloWidth: '60px',
  haloHeight: '60px',
}

export default function StakedBalanceDistributionChart({
  pool,
  isSmall = true,
}: {
  pool: Pool
  isSmall?: boolean
}) {
  const chartSizeValues = isSmall ? smallSize : normalSize
  const eChartsRef = useRef<EChartsReactCore | null>(null)
  const theme = useTheme()
  const colorMode = useThemeColorMode()

  function getData() {
    const data = []

    data.push({
      value: getUserWalletBalanceUsd(pool),
      name: 'Unstaked balance',
      itemStyle: {
        color: theme.semanticTokens.colors.font.light,
      },
    })

    data.push({
      value: calcTotalStakedBalanceUsd(pool),
      name: 'Staked balance',
      itemStyle: { color: theme.semanticTokens.colors.chart.stakedBalance },
    })

    return data
  }

  const chartOption = useMemo(() => {
    return {
      ...(chartSizeValues.chartHeight && { height: chartSizeValues.chartHeight }),
      tooltip: {
        trigger: 'item',
        show: false,
      },
      legend: {
        show: false,
      },
      grid: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['49%', '80%'],
          itemStyle: {
            borderColor: theme.colors['chartBorder'][colorMode],
            borderWidth: 0,
          },
          label: {
            show: false,
            position: 'center',
          },
          labelLine: {
            show: false,
          },
          emphasis: {
            scale: false,
          },
          data: getData(),
        },
      ],
    }
  }, [pool, colorMode])

  return (
    <HStack p={{ base: 'sm', md: '0' }} spacing={{ base: 'lg', md: '2xl' }}>
      <Box
        height={`${chartSizeValues.boxHeight}px`}
        position="relative"
        width={`${chartSizeValues.boxWidth}px`}
      >
        <Box
          alignItems="center"
          as={motion.div}
          bottom="0"
          display="flex"
          height={`${chartSizeValues.boxHeight * 0.5}px`}
          justifyContent="center"
          left="0"
          mx="auto"
          position="absolute"
          right="0"
          rounded="full"
          shadow="lg"
          top="50%"
          transform="translateY(-50%)"
          width={`${chartSizeValues.boxWidth * 0.5}px`}
          zIndex={4}
        >
          <NoisyCard
            cardProps={{
              rounded: 'full',
            }}
            contentProps={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              rounded: 'full',
              bg: 'background.level3',
            }}
            shadowContainerProps={{ shadow: 'none' }}
          />
        </Box>
        <Box
          background="background.level3"
          height={`${chartSizeValues.boxHeight}px`}
          position="relative"
          rounded="full"
          shadow="lg"
          width={`${chartSizeValues.boxWidth}px`}
        >
          <Box
            bg="transparent"
            height={`${chartSizeValues.boxHeight * 0.8}px`}
            left="0"
            marginX="auto"
            position="absolute"
            right="0"
            rounded="full"
            shadow="lg"
            top="50%"
            transform="translateY(-50%)"
            width={`${chartSizeValues.boxWidth * 0.8}px`}
            zIndex={2}
          />
          <ReactECharts
            onEvents={{}}
            option={chartOption}
            ref={eChartsRef}
            style={{
              width: `${chartSizeValues.boxWidth}px`,
              height: `${chartSizeValues.boxHeight}px`,
            }}
          />
        </Box>
      </Box>
      <VStack alignItems="flex-start">
        <HStack>
          <Box bg="font.light" height="12px" rounded="full" width="12px" />
          <Text color="font.secondary" whiteSpace="nowrap">
            Unstaked
          </Text>
        </HStack>
        <HStack>
          <Box bg="chart.stakedBalance" height="12px" rounded="full" width="12px" />
          <Text color="font.secondary" whiteSpace="nowrap">
            Staked on Balancer
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import { Box, HStack, Text, VStack, useTheme } from '@chakra-ui/react'
import { useMemo, useRef } from 'react'
import ReactECharts from 'echarts-for-react'
import EChartsReactCore from 'echarts-for-react/lib/core'
import { motion } from 'framer-motion'
import { ChartSizeValues } from './PoolWeightChart'
import { useThemeColorMode } from '@/lib/shared/services/chakra/useThemeColorMode'
import { NoisyCard } from '@/lib/shared/components/containers/NoisyCard'
import { Pool } from '../../PoolProvider'
import { calcTotalStakedBalanceUsd, getUserWalletBalanceUsd } from '../../user-balance.helpers'

const smallSize: ChartSizeValues = {
  chartHeight: '125px',
  boxWidth: 125,
  boxHeight: 125,
  haloTop: '40%',
  haloLeft: '55px',
  haloWidth: '40px',
  haloHeigth: '40px',
}

const normalSize: ChartSizeValues = {
  chartHeight: '225px',
  boxWidth: 225,
  boxHeight: 225,
  haloTop: '49%',
  haloLeft: '95px',
  haloWidth: '60px',
  haloHeigth: '60px',
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
        width={`${chartSizeValues.boxWidth}px`}
        height={`${chartSizeValues.boxHeight}px`}
        position="relative"
      >
        <Box
          position="absolute"
          as={motion.div}
          bottom="0"
          left="0"
          right="0"
          width={`${chartSizeValues.boxWidth * 0.5}px`}
          height={`${chartSizeValues.boxHeight * 0.5}px`}
          shadow="lg"
          zIndex={4}
          mx="auto"
          display="flex"
          justifyContent="center"
          alignItems="center"
          top="50%"
          transform="translateY(-50%)"
          rounded="full"
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
          ></NoisyCard>
        </Box>
        <Box
          position="relative"
          width={`${chartSizeValues.boxWidth}px`}
          height={`${chartSizeValues.boxHeight}px`}
          background="background.level3"
          shadow="lg"
          rounded="full"
        >
          <Box
            position="absolute"
            top="50%"
            right="0"
            left="0"
            marginX="auto"
            bg="transparent"
            zIndex={2}
            shadow={'lg'}
            transform="translateY(-50%)"
            width={`${chartSizeValues.boxWidth * 0.8}px`}
            height={`${chartSizeValues.boxHeight * 0.8}px`}
            rounded="full"
          />
          <ReactECharts
            style={{
              width: `${chartSizeValues.boxWidth}px`,
              height: `${chartSizeValues.boxHeight}px`,
            }}
            option={chartOption}
            onEvents={{}}
            ref={eChartsRef}
          />
        </Box>
      </Box>
      <VStack alignItems="flex-start">
        <HStack>
          <Box width="12px" height="12px" bg="font.light" rounded="full" />
          <Text whiteSpace="nowrap" color="font.secondary">
            Unstaked
          </Text>
        </HStack>
        <HStack>
          <Box width="12px" height="12px" bg="chart.stakedBalance" rounded="full" />
          <Text whiteSpace="nowrap" color="font.secondary">
            Staked on Balancer
          </Text>
        </HStack>
      </VStack>
    </HStack>
  )
}

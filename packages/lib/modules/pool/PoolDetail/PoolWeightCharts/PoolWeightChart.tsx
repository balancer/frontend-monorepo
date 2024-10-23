'use client'

import { GqlChain, GqlPoolTokenDetail } from '@repo/lib/shared/services/api/generated/graphql'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { Box, VStack, useTheme } from '@chakra-ui/react'
import EChartsReactCore from 'echarts-for-react/lib/core'
import { motion } from 'framer-motion'
import { useRef, useMemo } from 'react'
import PoolWeightChartLegend from './PoolWeightChartLegend'
import Image from 'next/image'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { fNum } from '@repo/lib/shared/utils/numbers'

export interface PoolWeightChartProps {
  displayTokens: GqlPoolTokenDetail[]
  chain: GqlChain
  totalLiquidity: string
  hasLegend?: boolean
  isSmall?: boolean
  colors?: PoolWeightChartColorDef[]
}

export interface ChartSizeValues {
  chartHeight: string
  boxWidth: number
  boxHeight: number
  haloTop: string
  haloLeft: string
  haloWidth: string
  haloHeigth: string
}

export interface PoolWeightChartColorDef {
  from: string
  to: string
}

export const DEFAULT_POOL_WEIGHT_CHART_COLORS: PoolWeightChartColorDef[] = [
  {
    from: '#1E4CF1',
    to: '#00FFAA',
  },
  {
    from: '#B2C4DB',
    to: '#FDFDFD',
  },
  {
    from: '#EF4A2B',
    to: '#F48975',
  },
  {
    from: '#FFD600',
    to: '#F48975',
  },
  {
    from: '#9C68AA',
    to: '#C03BE4',
  },
  {
    from: '#FFBD91',
    to: '#FF957B',
  },
  {
    from: '#30CEF0',
    to: '#02A2FE',
  },
  {
    from: '#30CEF0',
    to: '#02A2FE',
  },
]

const defaultColor: PoolWeightChartColorDef = {
  from: '#30CEF0',
  to: '#02A2FE',
}

const smallSize: ChartSizeValues = {
  chartHeight: '140px',
  boxWidth: 140,
  boxHeight: 140,
  haloTop: '40%',
  haloLeft: '55px',
  haloWidth: '40px',
  haloHeigth: '40px',
}

const normalSize: ChartSizeValues = {
  chartHeight: '250px',
  boxWidth: 250,
  boxHeight: 250,
  haloTop: '49%',
  haloLeft: '95px',
  haloWidth: '60px',
  haloHeigth: '60px',
}

function OuterSymbolCircle({ opacity, isSmall }: { opacity: string; isSmall: boolean }) {
  const colorMode = useThemeColorMode()
  const theme = useTheme()
  const colorModeKey = colorMode === 'light' ? 'default' : '_dark'
  const chartOuter = isSmall ? '' : theme.semanticTokens.shadows.chartIconOuter[colorModeKey]
  return (
    <Box
      alignItems="center"
      display="flex"
      filter={chartOuter}
      height="55%"
      justifyContent="center"
      opacity={opacity}
      overflow="hidden"
      position="absolute"
      rounded="full"
      top="50%"
      transform="translateY(-50%)"
      width="55%"
    >
      <Box bg="background.level3" filter={chartOuter} height="full" shadow="2xl" width="full" />
    </Box>
  )
}

function InnerSymbolCircle({ opacity }: { opacity: string; isSmall: boolean }) {
  return (
    <Box
      height="45%"
      opacity={opacity}
      overflow="hidden"
      position="absolute"
      rounded="full"
      top="50%"
      transform="translateY(-50%)"
      width="45%"
    >
      <Box
        alignItems="center"
        bg="background.level4"
        display="flex"
        height="full"
        justifyContent="center"
        position="relative"
        width="full"
      />
    </Box>
  )
}

export function PoolWeightChart({
  displayTokens,
  chain,
  hasLegend,
  isSmall,
  colors = DEFAULT_POOL_WEIGHT_CHART_COLORS,
  totalLiquidity,
}: PoolWeightChartProps) {
  const chartSizeValues = isSmall ? smallSize : normalSize
  const eChartsRef = useRef<EChartsReactCore | null>(null)
  const theme = useTheme()
  const colorMode = useThemeColorMode()
  const { calcWeightForBalance } = useTokens()

  const chartOption = useMemo(() => {
    return {
      ...(chartSizeValues.chartHeight && { height: chartSizeValues.chartHeight }),
      tooltip: {
        trigger: 'item',
        valueFormatter: (value: string) => fNum('weight', value, { abbreviated: false }),
      },
      animation: false,
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
          name: 'Pool composition',
          type: 'pie',
          radius: ['70%', '99%'],
          itemStyle: {
            borderColor: theme.colors['chartBorder'][colorMode],
            borderWidth: 1.5,
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
          data: displayTokens.map((token, i) => ({
            value: calcWeightForBalance(token.address, token.balance, totalLiquidity, chain),
            name: token.symbol,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 1,
                  color: colors[i]?.from || defaultColor.from,
                },
                {
                  offset: 0,
                  color: colors[i]?.to || defaultColor.to,
                },
              ]),
            },
          })),
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayTokens, totalLiquidity, chain, colorMode])

  return (
    <VStack>
      <Box
        _groupHover={{ transform: 'translateY(0) scale(1.05)' }}
        height={`${chartSizeValues.boxHeight}`}
        position="relative"
        transition="all 0.2s var(--ease-out-cubic)"
        width={`${chartSizeValues.boxWidth}px`}
      >
        <Box height="full" position="absolute" rounded="full" shadow="md" top="0" width="full" />
        <Box
          alignItems="center"
          as={motion.div}
          bottom="0"
          display="flex"
          height={`${chartSizeValues.boxHeight * 0.7}px`}
          justifyContent="center"
          left="0"
          mx="auto"
          position="absolute"
          right="0"
          rounded="full"
          top="50%"
          transform="translateY(-50%)"
          width={`${chartSizeValues.boxWidth * 0.7}px`}
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
              shadow: 'innerXl',
              rounded: 'full',
            }}
            shadowContainerProps={{ shadow: 'none' }}
          >
            <Box
              _groupHover={{ transform: 'scale(1.15) translateY(-50%)' }}
              position="absolute"
              top="50%"
              transform="translateY(-50%)"
              transformOrigin="center"
              transition="all 0.2s ease-out"
              zIndex={5}
            >
              <Image
                alt={`Chain icon for ${chain.toLowerCase()}`}
                height={isSmall ? 28 : 36}
                src={`/images/chains/${chain}.svg`}
                width={isSmall ? 28 : 36}
              />
            </Box>

            {/* Since these triangles utilise clip-path, we cannot use box-shadow, we need to utilise css filters */}
            {/* Simply applying an opacity to the background color will achieve weird effects, so to match the designs */}
            {/* We utilise layers of the same component! */}
            <OuterSymbolCircle isSmall={isSmall || false} opacity="10%" />
            <OuterSymbolCircle isSmall={isSmall || false} opacity="20%" />
            <OuterSymbolCircle isSmall={isSmall || false} opacity="20%" />
            <InnerSymbolCircle isSmall={isSmall || false} opacity="30%" />
            <InnerSymbolCircle isSmall={isSmall || false} opacity="30%" />
            <InnerSymbolCircle isSmall={isSmall || false} opacity="30%" />
          </NoisyCard>
        </Box>
        <Box
          height={`${chartSizeValues.boxHeight}`}
          position="relative"
          width={`${chartSizeValues.boxWidth}`}
        >
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
      {hasLegend && <PoolWeightChartLegend colors={colors} displayTokens={displayTokens} />}
    </VStack>
  )
}

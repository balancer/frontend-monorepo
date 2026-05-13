'use client'

import { Box, Card, Flex, HStack, Heading, Skeleton, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo, useState } from 'react'
import {
  usePoolTypeBreakdown,
  useVersionTvlBreakdown,
} from '@analytics/lib/hooks/usePoolTypeBreakdown'

type Mode = 'TYPE' | 'VERSION'

const COLORS: Record<Mode, string[]> = {
  TYPE: ['#E6C6A0', '#9f95f0', '#EA9A43', '#25e2a4', '#56c596', '#b3aef5', '#718096'],
  // v3 amber-accent (the brand "special" tone) on top, v2 muted, CoW grey
  VERSION: ['#E6C6A0', '#9f95f0', '#25e2a4'],
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(n)

// More verbose than @repo/lib's `getPoolTypeLabel` (which collapses every
// stable variant to "Stable" and renames QuantAMM to "BTF"). For an analytics
// breakdown we want to preserve the underlying pool engineering so curious
// users can see e.g. that ComposableStable and MetaStable are distinct.
const POOL_TYPE_OVERRIDES: Record<string, string> = {
  COMPOSABLE_STABLE: 'Composable Stable',
  META_STABLE: 'Meta Stable',
  PHANTOM_STABLE: 'Phantom Stable',
  QUANT_AMM_WEIGHTED: 'QuantAMM Weighted',
  COW_AMM: 'CoW AMM',
  LIQUIDITY_BOOTSTRAPPING: 'Liquidity Bootstrapping',
  FIXED_LBP: 'Fixed LBP',
  RECLAMM: 'reCLAMM',
  GYRO: 'Gyro 2-CLP',
  GYRO3: 'Gyro 3-CLP',
  GYROE: 'Gyro E-CLP',
  FX: 'FX',
}

function humanizePoolType(raw: string): string {
  const upper = raw.toUpperCase()
  if (POOL_TYPE_OVERRIDES[upper]) return POOL_TYPE_OVERRIDES[upper]
  return upper
    .split('_')
    .filter(Boolean)
    .map(seg => seg.charAt(0) + seg.slice(1).toLowerCase())
    .join(' ')
}

export function PoolCompositionDonut() {
  const [mode, setMode] = useState<Mode>('TYPE')
  const typeBreakdown = usePoolTypeBreakdown()
  const versionBreakdown = useVersionTvlBreakdown()

  const { data: rawData, loading } = mode === 'TYPE' ? typeBreakdown : versionBreakdown
  const palette = COLORS[mode]

  const data = useMemo(
    () =>
      (rawData ?? []).map(d => ({
        ...d,
        displayName: mode === 'TYPE' ? humanizePoolType(d.name) : d.name,
      })),
    [rawData, mode]
  )

  const total = data.reduce((a, b) => a + b.tvl, 0)
  const option = useMemo(
    () => ({
      tooltip: {
        trigger: 'item',
        backgroundColor: '#383E47',
        textStyle: { color: '#E5D3BE' },
        valueFormatter: (v: number) => usd(v),
      },
      series: [
        {
          type: 'pie',
          // Thinner donut + larger outer radius for the frontend-v3
          // PoolWeightChart feel.
          radius: ['70%', '99%'],
          avoidLabelOverlap: false,
          label: { show: false, position: 'center' },
          labelLine: { show: false },
          // Borderless: slices butt directly against each other so the ring
          // reads as one continuous donut rather than segmented pills.
          itemStyle: { borderWidth: 0 },
          // Disable the default scale-on-hover so slices feel solid; the
          // tooltip alone carries the interaction signal.
          emphasis: { scale: false },
          data: data.map((d, i) => {
            const c = palette[i % palette.length]
            // Vertical gradient per slice (top full → bottom 35%) so the
            // donut reads with depth, matching the v3 pool weight chart.
            return {
              name: d.displayName,
              value: d.tvl,
              itemStyle: {
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: c },
                    { offset: 1, color: `${c}59` },
                  ],
                },
              },
            }
          }),
        },
      ],
    }),
    [data, palette]
  )

  return (
    <Card variant="level1">
      <Flex align="center" flexWrap="wrap" gap="xs" justify="space-between" mb="md">
        <Heading size="h6">Pool composition</Heading>
        <ModeToggle mode={mode} onChange={setMode} />
      </Flex>
      {loading || !data.length ? (
        <Skeleton h="200px" />
      ) : (
        <HStack align="center" spacing="md">
          <Box flexShrink={0} h="200px" position="relative" w="200px">
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            <VStack inset={0} justify="center" pointerEvents="none" position="absolute" spacing={0}>
              <Text color="font.secondary" fontSize="xs">
                TVL
              </Text>
              <Text color="font.maxContrast" fontSize="md" fontWeight="bold">
                {usd(total)}
              </Text>
            </VStack>
          </Box>
          <VStack align="stretch" flex={1} minW={0} spacing="sm">
            {data.map((d, i) => (
              <Flex align="center" gap="sm" key={d.name}>
                <Box
                  bg={palette[i % palette.length]}
                  borderRadius="2px"
                  flexShrink={0}
                  h="8px"
                  w="8px"
                />
                <Text color="font.secondary" flex={1} fontSize="sm" noOfLines={1}>
                  {d.displayName}
                </Text>
                <Text color="font.secondary" fontSize="xs">
                  {total > 0 ? ((d.tvl / total) * 100).toFixed(1) : '0.0'}%
                </Text>
              </Flex>
            ))}
          </VStack>
        </HStack>
      )}
    </Card>
  )
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (m: Mode) => void
}) {
  return (
    <HStack
      bg="background.level0"
      border="1px solid"
      borderColor="border.subduedZen"
      borderRadius="full"
      p="3px"
      spacing={0}
    >
      {(['TYPE', 'VERSION'] as Mode[]).map(m => (
        <Box
          as="button"
          bg={mode === m ? 'background.level3' : 'transparent'}
          borderRadius="full"
          color={mode === m ? 'font.maxContrast' : 'font.secondary'}
          fontSize="xs"
          fontWeight="medium"
          key={m}
          onClick={() => onChange(m)}
          px="ms"
          py="xs"
        >
          {m === 'TYPE' ? 'Type' : 'Version'}
        </Box>
      ))}
    </HStack>
  )
}

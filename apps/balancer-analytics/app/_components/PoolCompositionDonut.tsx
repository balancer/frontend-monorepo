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
  TYPE: ['#9f95f0', '#E6C6A0', '#EA9A43', '#25e2a4', '#718096'],
  // v3 amber-accent (the brand "special" tone) on top, v2 muted, CoW grey
  VERSION: ['#E6C6A0', '#9f95f0', '#718096'],
}

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 0,
  }).format(n)

export function PoolCompositionDonut() {
  const [mode, setMode] = useState<Mode>('TYPE')
  const typeBreakdown = usePoolTypeBreakdown()
  const versionBreakdown = useVersionTvlBreakdown()

  const { data, loading } =
    mode === 'TYPE' ? typeBreakdown : versionBreakdown
  const palette = COLORS[mode]

  const total = (data ?? []).reduce((a, b) => a + b.tvl, 0)
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
          radius: ['50%', '78%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#383E47', borderWidth: 2 },
          data: (data ?? []).map((d, i) => ({
            name: d.name,
            value: d.tvl,
            itemStyle: { color: palette[i % palette.length] },
          })),
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
      {loading || !data ? (
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
                  {d.name}
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

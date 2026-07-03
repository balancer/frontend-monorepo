'use client'

import { Box, Card, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import type { TokenAggregate } from '@analytics/lib/hooks/usePortfolioByAddress'

const PALETTE = [
  '#E6C6A0',
  '#9f95f0',
  '#EA9A43',
  '#25e2a4',
  '#56c596',
  '#b3aef5',
  '#9bb4ff',
  '#f2b48d',
  '#a8e6cf',
  '#dcd0ff',
]

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)

const TOP_N = 8

type Slice = { key: string; name: string; value: number }

// Human-readable chain suffix, used only when we need to disambiguate two
// same-symbol entries (USDp on Mainnet vs Avalanche). Plain `chain` enums
// like HYPEREVM render badly title-cased, so this is just a quick helper.
function shortChain(chain: string): string {
  return chain.charAt(0) + chain.slice(1).toLowerCase()
}

export function PortfolioTokenDonut({ tokens }: { tokens: TokenAggregate[] }) {
  // Collapse the long tail into a single "Other" slice so the donut stays
  // legible even for wallets with 30+ underlying token exposures. Each
  // slice carries a unique `key` (chain:address) for React + a possibly-
  // disambiguated `name` for echarts; symbols that repeat across chains
  // get a `(Chain)` suffix so the legend reads unambiguously.
  const slices = useMemo<Slice[]>(() => {
    const head = tokens.slice(0, TOP_N)
    const tail = tokens.slice(TOP_N)

    // Count symbol occurrences in the visible head so we only suffix when
    // there's an actual collision.
    const symbolCounts = new Map<string, number>()
    for (const t of head) {
      symbolCounts.set(t.symbol, (symbolCounts.get(t.symbol) ?? 0) + 1)
    }

    const out: Slice[] = head.map(t => ({
      key: `${t.chain}:${t.address.toLowerCase()}`,
      name:
        (symbolCounts.get(t.symbol) ?? 0) > 1
          ? `${t.symbol} (${shortChain(t.chain)})`
          : t.symbol,
      value: t.valueUsd,
    }))

    const tailValue = tail.reduce((acc, t) => acc + t.valueUsd, 0)
    if (tailValue > 0) {
      out.push({ key: '__other__', name: `Other (${tail.length})`, value: tailValue })
    }
    return out
  }, [tokens])

  const total = slices.reduce((a, b) => a + b.value, 0)

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
          radius: ['70%', '99%'],
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderWidth: 0 },
          emphasis: { scale: false },
          data: slices.map((s, i) => {
            const c = PALETTE[i % PALETTE.length]
            return {
              name: s.name,
              value: s.value,
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
    [slices]
  )

  return (
    <Card h="full" variant="level1">
      <Flex align="center" flexWrap="wrap" gap="xs" justify="space-between" mb="md">
        <Heading size="h6">Token exposure</Heading>
        <Text color="font.secondary" fontSize="xs">
          {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'}
        </Text>
      </Flex>
      {slices.length === 0 ? (
        <Text color="font.secondary" fontSize="sm">
          No token data available.
        </Text>
      ) : (
        <HStack align="center" spacing="md">
          <Box flexShrink={0} h="200px" position="relative" w="200px">
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            <VStack inset={0} justify="center" pointerEvents="none" position="absolute" spacing={0}>
              <Text color="font.secondary" fontSize="xs">
                Total
              </Text>
              <Text color="font.maxContrast" fontSize="md" fontWeight="bold">
                {usd(total)}
              </Text>
            </VStack>
          </Box>
          <VStack align="stretch" flex={1} minW={0} spacing="xs">
            {slices.slice(0, 7).map((s, i) => (
              <Flex align="center" gap="sm" key={s.key}>
                <Box
                  bg={PALETTE[i % PALETTE.length]}
                  borderRadius="2px"
                  flexShrink={0}
                  h="8px"
                  w="8px"
                />
                <Text color="font.secondary" flex={1} fontSize="sm" noOfLines={1}>
                  {s.name}
                </Text>
                <Text color="font.secondary" fontSize="xs">
                  {total > 0 ? ((s.value / total) * 100).toFixed(1) : '0.0'}%
                </Text>
              </Flex>
            ))}
            {slices.length > 7 && (
              <Text color="font.tertiary" fontSize="2xs">
                +{slices.length - 7} more
              </Text>
            )}
          </VStack>
        </HStack>
      )}
    </Card>
  )
}

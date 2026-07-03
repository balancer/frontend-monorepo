'use client'

import {
  Badge,
  Box,
  Card,
  Flex,
  HStack,
  Heading,
  Skeleton,
  Stack,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import { ExternalLink } from 'react-feather'
import { NetworkIcon } from '@repo/lib/shared/components/icons/NetworkIcon'
import { getChainShortName } from '@repo/lib/config/app.config'
import { CHAIN_COLORS } from '@analytics/app/_components/chainColors'
import { useBalSupplyByChain } from '@analytics/lib/hooks/useBalSupplyByChain'
import { getBlockExplorerAddressUrl } from '@analytics/lib/networks/chain-info'
import type { BalSupplyPoint } from '@analytics/app/api/governance/bal-supply/route'

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})
const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

/**
 * Cross-chain BAL token distribution. Two coordinated views side-by-side:
 *   - **Donut** (left): each chain as a slice sized by its share of the
 *     summed BAL supply. Centre shows the absolute total.
 *   - **Per-chain list** (right): chain icon · short name (linked to the
 *     BAL contract on that chain's explorer) · bar · compact amount + %.
 *
 * Both views read from the same `useBalSupplyByChain` payload — the
 * donut answers "what's the broad-strokes split?" at a glance; the list
 * carries the addresses and absolute amounts for forensics.
 *
 * Mainnet still carries the canonical issuance; every other chain's
 * value is what's currently bridged (LayerZero OFT and friends). The
 * upcoming naked-BAL voting strategy will count all of it toward
 * governance power, so "where does BAL actually live today?" is the
 * first question a governance researcher will ask.
 */
export function BalSupplyByChainCard() {
  const { data, loading, error } = useBalSupplyByChain()

  const chartOption = useMemo(
    () => (data ? buildDonutOption(data.points) : null),
    [data]
  )

  return (
    <Card display="flex" flexDirection="column" h="full" variant="level1">
      <Flex align="center" justify="space-between" mb="md">
        <HStack spacing="sm">
          <Heading size="h5">BAL token supply by chain</Heading>
          <Tooltip
            hasArrow
            label="BAL on every chain it lives on counts toward governance voting power under the active multi-chain BAL voting strategy. Reads totalSupply() on each chain's BAL ERC20."
            openDelay={250}
          >
            <Badge colorScheme="purple" cursor="help" fontSize="xs" variant="subtle">
              BAL
            </Badge>
          </Tooltip>
        </HStack>
        {data && (
          <Text color="font.secondary" fontSize="sm">
            total {compactFmt.format(data.totalHuman)} BAL
          </Text>
        )}
      </Flex>

      {error ? (
        <Text color="red.300" fontSize="sm">
          Failed to load: {error.message}
        </Text>
      ) : loading || !data ? (
        <Skeleton flex={1} minH="240px" />
      ) : data.points.length === 0 ? (
        <Text color="font.secondary" fontSize="sm">
          No chains with BAL configured.
        </Text>
      ) : (
        <Stack
          align="stretch"
          direction="column"
          flex={1}
          spacing="md"
        >
          {/* Donut on top — centred, capped width so the centre label stays
              legible and the chart doesn't sprawl on wide cards. The
              per-chain list lives below for the address links and
              absolute amounts. */}
          <Box alignSelf="center" flexShrink={0} h="220px" position="relative" w="220px">
            {chartOption && (
              <ReactECharts
                notMerge
                option={chartOption}
                style={{ height: '100%', width: '100%' }}
              />
            )}
            <VStack
              inset={0}
              justify="center"
              pointerEvents="none"
              position="absolute"
              spacing="2xs"
            >
              <Text color="font.secondary" fontSize="sm">
                Total BAL
              </Text>
              <Text color="font.maxContrast" fontSize="lg" fontWeight="bold">
                {compactFmt.format(data.totalHuman)}
              </Text>
            </VStack>
          </Box>

          <VStack align="stretch" flex={1} justify="center" minW={0} spacing="ms">
            {data.points.map(p => {
              const human = p.totalSupplyHuman
              const share = human !== null && data.totalHuman > 0 ? human / data.totalHuman : 0
              const color = CHAIN_COLORS[p.chain] ?? '#718096'
              return (
                <Box
                  alignItems="center"
                  display="grid"
                  gap="ms"
                  gridTemplateColumns="140px 1fr 110px"
                  key={p.chain}
                >
                  <HStack spacing="xs">
                    <NetworkIcon chain={p.chain} size={5} />
                    <a
                      href={getBlockExplorerAddressUrl(p.address, p.chain)}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <HStack color="font.link" spacing="2xs">
                        <Text fontSize="sm" fontWeight="medium">
                          {getChainShortName(p.chain)}
                        </Text>
                        <ExternalLink size={12} />
                      </HStack>
                    </a>
                  </HStack>
                  <Box bg="background.level0" borderRadius="full" h="6px" overflow="hidden">
                    <Box
                      bgGradient={`linear(to-r, ${color}, ${color}cc)`}
                      borderRadius="full"
                      boxShadow={`0 0 12px ${color}55`}
                      h="100%"
                      w={`${share * 100}%`}
                    />
                  </Box>
                  <Flex align="baseline" gap="xs" justify="space-between">
                    <Tooltip
                      hasArrow
                      label={
                        human !== null
                          ? `${intFmt.format(human)} BAL`
                          : 'Read failed on this chain'
                      }
                      openDelay={250}
                    >
                      <Text cursor="help" fontSize="sm" fontWeight="medium">
                        {human !== null ? compactFmt.format(human) : '—'}
                      </Text>
                    </Tooltip>
                    <Text color="font.secondary" fontSize="sm">
                      {(share * 100).toFixed(1)}%
                    </Text>
                  </Flex>
                </Box>
              )
            })}
          </VStack>
        </Stack>
      )}
    </Card>
  )
}

// Donut matches the styling of PoolCompositionDonut — thin ring with a
// per-slice vertical gradient so the chart reads with depth and lines up
// visually with the protocol-overview composition donut. Chain colours
// come from the same `CHAIN_COLORS` map the bar list uses, so a slice
// and its row share the same accent.
function buildDonutOption(points: BalSupplyPoint[]) {
  const sliced = points.filter(p => p.totalSupplyHuman !== null && p.totalSupplyHuman > 0)
  return {
    animation: false,
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#383E47',
      textStyle: { color: '#E5D3BE' },
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}<br/>${intFmt.format(params.value)} BAL · ${params.percent.toFixed(1)}%`,
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['70%', '99%'],
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' as const },
        labelLine: { show: false },
        itemStyle: { borderWidth: 0 },
        emphasis: { scale: false },
        data: sliced.map(p => {
          const c = CHAIN_COLORS[p.chain] ?? '#718096'
          return {
            name: getChainShortName(p.chain),
            value: p.totalSupplyHuman ?? 0,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: c },
                  // Same `cc59`-style alpha falloff PoolCompositionDonut
                  // uses — slice top is the full chain colour, bottom
                  // fades to ~35% opacity.
                  { offset: 1, color: `${c}59` },
                ],
              },
            },
          }
        }),
      },
    ],
  }
}

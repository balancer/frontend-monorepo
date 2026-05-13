'use client'

import { SimpleGrid, VStack } from '@chakra-ui/react'
import { useProtocolStats } from '@repo/lib/shared/hooks/useProtocolStats'
import { useKpiSparks } from '@analytics/lib/hooks/useKpiSparks'
import { KpiCard } from './KpiCard'

const usd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n || 0)

// Hierarchy: one full-width TVL hero on top (headline metric, sparkline +
// bigger value), then a uniform 4-card strip for the 24h flow metrics.
// LPs and pool count are intentionally dropped — they're niche and the pool
// monitor section already exposes the pool count.
export function HeroKpiStrip() {
  const { statQuery } = useProtocolStats()
  const d = statQuery.data?.protocolMetricsAggregated
  const apiLoading = statQuery.loading
  const sparks = useKpiSparks({ days: 30 })
  const loading = apiLoading || sparks.loading

  return (
    <VStack align="stretch" spacing="md">
      <KpiCard
        big
        delta={sparks.tvl.delta24h}
        isLoading={loading}
        label="Total value locked"
        spark={sparks.tvl.values}
        sparkColor="#E6C6A0"
        sub="across Balancer v2, v3 and CoW AMM"
        value={usd(Number(d?.totalLiquidity ?? 0))}
      />
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="md">
        <KpiCard
          delta={sparks.volume.delta24h}
          isLoading={loading}
          label="Volume · 24h"
          spark={sparks.volume.values}
          sparkColor="#EA9A43"
          value={usd(Number(d?.swapVolume24h ?? 0))}
        />
        <KpiCard
          delta={sparks.fees.delta24h}
          isLoading={loading}
          label="Swap fees · 24h"
          spark={sparks.fees.values}
          sparkColor="green.400"
          value={usd(Number(d?.swapFee24h ?? 0))}
        />
        <KpiCard
          delta={sparks.yield.delta24h}
          isLoading={loading}
          label="Yield captured · 24h"
          spark={sparks.yield.values}
          sparkColor="#b3aef5"
          value={usd(Number(d?.yieldCapture24h ?? 0))}
        />
        <KpiCard
          delta={sparks.surplus.delta24h}
          isLoading={loading}
          label="Surplus · 24h"
          spark={sparks.surplus.values}
          sparkColor="#9f95f0"
          value={usd(Number(d?.surplus24h ?? 0))}
        />
      </SimpleGrid>
    </VStack>
  )
}

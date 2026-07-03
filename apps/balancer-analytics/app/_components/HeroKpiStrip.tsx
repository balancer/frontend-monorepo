'use client'

import { SimpleGrid } from '@chakra-ui/react'
import { useProtocolStats } from '@repo/lib/shared/hooks/useProtocolStats'
import { useKpiSparks } from '@analytics/lib/hooks/useKpiSparks'
import { KpiCard } from './KpiCard'
import { usd } from './format'

// Four 24h flow metrics in a uniform strip. TVL deliberately isn't here —
// it's the headline metric of the Protocol metrics chart immediately below,
// so duplicating it as a card would just be visual noise.
export function HeroKpiStrip() {
  const { statQuery } = useProtocolStats()
  const d = statQuery.data?.protocolMetricsAggregated
  const sparks = useKpiSparks({ days: 30 })
  const loading = statQuery.loading || sparks.loading

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing="md">
      <KpiCard
        delta={sparks.volume.delta24h}
        isLoading={loading}
        label="Volume · 24h"
        spark={sparks.volume.values}
        sparkColor="orange.300"
        textured
        value={usd(Number(d?.swapVolume24h ?? 0))}
      />
      <KpiCard
        delta={sparks.fees.delta24h}
        isLoading={loading}
        label="Swap fees · 24h"
        spark={sparks.fees.values}
        sparkColor="green.400"
        textured
        value={usd(Number(d?.swapFee24h ?? 0))}
      />
      <KpiCard
        delta={sparks.yield.delta24h}
        isLoading={loading}
        label="Yield captured · 24h"
        spark={sparks.yield.values}
        sparkColor="purple.300"
        textured
        value={usd(Number(d?.yieldCapture24h ?? 0))}
      />
      <KpiCard
        delta={sparks.surplus.delta24h}
        isLoading={loading}
        label="CoW AMM surplus · 24h"
        spark={sparks.surplus.values}
        sparkColor="purple.400"
        textured
        tooltip="Trader surplus captured by Balancer's CoW AMM pools (MEV-protected, batch-settled). CoW AMM-specific — does not apply to v2 or v3 pools."
        value={usd(Number(d?.surplus24h ?? 0))}
      />
    </SimpleGrid>
  )
}

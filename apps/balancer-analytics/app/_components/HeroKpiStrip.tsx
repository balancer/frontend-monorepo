'use client'

import { Grid, GridItem, SimpleGrid } from '@chakra-ui/react'
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
const num = (n: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n || 0)

export function HeroKpiStrip() {
  const { statQuery } = useProtocolStats()
  const d = statQuery.data?.protocolMetricsAggregated
  const apiLoading = statQuery.loading
  const sparks = useKpiSparks({ days: 30 })
  const loading = apiLoading || sparks.loading

  // Headline values come from api-v3's live point-in-time aggregate; sparks +
  // deltas come from the snapshot history. Two sources can briefly disagree
  // by minutes if the cron hasn't ticked since the api-v3 value last moved —
  // acceptable for a hero strip.
  return (
    <>
      <Grid gap="md" mb="md" templateColumns={{ base: '1fr', md: '1.4fr 1fr 1fr 1fr' }}>
        <GridItem>
          <KpiCard
            accent="#E6C6A0"
            big
            delta={sparks.tvl.delta24h}
            isLoading={loading}
            label="Total value locked"
            spark={sparks.tvl.values}
            sparkColor="#E6C6A0"
            sub="across v2 + v3"
            value={usd(Number(d?.totalLiquidity ?? 0))}
          />
        </GridItem>
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
      </Grid>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="md">
        <KpiCard
          accent="#25e2a4"
          delta={sparks.lps.delta24h}
          isLoading={loading}
          label="Liquidity providers"
          spark={sparks.lps.values}
          sparkColor="#25e2a4"
          value={num(Number(d?.numLiquidityProviders ?? 0))}
        />
        <KpiCard
          accent="#E6C6A0"
          delta={sparks.pools.delta24h}
          isLoading={loading}
          label="Active pools"
          spark={sparks.pools.values}
          sparkColor="#E6C6A0"
          value={num(Number(d?.poolCount ?? 0))}
        />
        <KpiCard
          accent="#9f95f0"
          delta={sparks.surplus.delta24h}
          isLoading={loading}
          label="Surplus · 24h"
          spark={sparks.surplus.values}
          sparkColor="#9f95f0"
          sub="StableSurge · MEV recapture"
          value={usd(Number(d?.surplus24h ?? 0))}
        />
      </SimpleGrid>
    </>
  )
}

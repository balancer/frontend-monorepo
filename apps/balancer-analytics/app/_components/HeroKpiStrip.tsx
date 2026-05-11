'use client'

import { Grid, GridItem, SimpleGrid } from '@chakra-ui/react'
import { useProtocolStats } from '@repo/lib/shared/hooks/useProtocolStats'
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

// Deltas + sparklines need historical points. api-v3 only exposes the current
// snapshot, so deltas stay null until the snapshotter (lib/snapshots/) lands.
// Cards already short-circuit on null so they degrade cleanly.
const NULL_DELTA = null
const NULL_SPARK = undefined

export function HeroKpiStrip() {
  const { statQuery } = useProtocolStats()
  const d = statQuery.data?.protocolMetricsAggregated
  const loading = statQuery.loading

  return (
    <>
      <Grid gap="md" mb="md" templateColumns={{ base: '1fr', md: '1.4fr 1fr 1fr 1fr' }}>
        <GridItem>
          <KpiCard
            accent="#E6C6A0"
            big
            delta={NULL_DELTA}
            isLoading={loading}
            label="Total value locked"
            spark={NULL_SPARK}
            sparkColor="#E6C6A0"
            sub="across v2 + v3"
            value={usd(Number(d?.totalLiquidity ?? 0))}
          />
        </GridItem>
        <KpiCard
          delta={NULL_DELTA}
          isLoading={loading}
          label="Volume · 24h"
          spark={NULL_SPARK}
          sparkColor="#EA9A43"
          value={usd(Number(d?.swapVolume24h ?? 0))}
        />
        <KpiCard
          delta={NULL_DELTA}
          isLoading={loading}
          label="Swap fees · 24h"
          spark={NULL_SPARK}
          sparkColor="green.400"
          value={usd(Number(d?.swapFee24h ?? 0))}
        />
        <KpiCard
          delta={NULL_DELTA}
          isLoading={loading}
          label="Yield captured · 24h"
          spark={NULL_SPARK}
          sparkColor="#b3aef5"
          value={usd(Number(d?.yieldCapture24h ?? 0))}
        />
      </Grid>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing="md">
        <KpiCard
          accent="#25e2a4"
          isLoading={loading}
          label="Liquidity providers"
          sparkColor="green.400"
          value={num(Number(d?.numLiquidityProviders ?? 0))}
        />
        <KpiCard
          accent="#E6C6A0"
          isLoading={loading}
          label="Active pools"
          value={num(Number(d?.poolCount ?? 0))}
        />
        <KpiCard
          accent="#9f95f0"
          isLoading={loading}
          label="Surplus · 24h"
          sub="StableSurge · MEV recapture"
          value={usd(Number(d?.surplus24h ?? 0))}
        />
        <KpiCard
          accent="#F06147"
          isLoading={loading}
          label="Networks live"
          sub="v3 vault deployments"
          value={String(d ? 10 : 0)}
        />
      </SimpleGrid>
    </>
  )
}

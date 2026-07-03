'use client'

import { SimpleGrid } from '@chakra-ui/react'
import { KpiCard } from '@analytics/app/_components/KpiCard'
import { useBalSupplyByChain } from '@analytics/lib/hooks/useBalSupplyByChain'
import { useVeBalStats } from '@analytics/lib/hooks/useVeBalStats'

const compactFmt = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

/**
 * Three-card KPI strip for the governance page. Mirrors `HeroKpiStrip` on
 * the home dashboard (same `KpiCard`, same textured backdrop) so the
 * visual rhythm carries between pages.
 *
 * Cards:
 *   - **Total BAL** — sum of `totalSupply()` across every supported
 *     chain where BAL is deployed. The headline number behind the
 *     multi-chain BAL voting strategy.
 *   - **Total veBAL** — current voting power outstanding on mainnet.
 *   - **Avg veBAL lock** — system-wide average lock duration in years
 *     (veBAL max lock = 1 year, so the multiplier maps directly to
 *     years).
 *
 * Data sources mirror what the cards below the strip use, so they ride
 * the same browser/CDN cache windows — no extra network cost despite
 * the duplicate `useBalSupplyByChain` / `useVeBalStats` calls.
 */
export function GovernanceHeroStrip() {
  const balSupply = useBalSupplyByChain()
  const veBal = useVeBalStats()

  const totalBal = balSupply.data?.totalHuman ?? null
  const chainCount = balSupply.data?.points.filter(p => p.totalSupplyHuman !== null).length ?? 0
  const veBalTotal = veBal.data?.veBalTotalSupply ?? null
  const bptLocked = veBal.data?.bptLocked ?? null
  const avgLockYears = veBal.data?.averageLockYears ?? null

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing="md">
      <KpiCard
        isLoading={balSupply.loading}
        label="Total BAL"
        sub={chainCount > 0 ? `across ${chainCount} chains` : undefined}
        textured
        tooltip="Sum of BAL totalSupply() across every supported chain — mainnet canonical issuance plus all bridged amounts."
        value={totalBal === null ? '—' : `${compactFmt.format(totalBal)} BAL`}
      />
      <KpiCard
        isLoading={veBal.loading}
        label="Total veBAL"
        sub={
          bptLocked !== null
            ? `${compactFmt.format(bptLocked)} BPT locked`
            : undefined
        }
        textured
        tooltip="Total veBAL voting power outstanding on mainnet. New locks are disabled per BIP-921."
        value={veBalTotal === null ? '—' : `${compactFmt.format(veBalTotal)} veBAL`}
      />
      <KpiCard
        isLoading={veBal.loading}
        label="Avg veBAL lock"
        sub="max lock: 1 year"
        textured
        tooltip="System-wide average lock duration. veBAL = BPT × locked_years / max_years; we surface the duration directly. veBAL's max lock is 1 year (NOT 4 like veCRV)."
        value={avgLockYears === null ? '—' : `${avgLockYears.toFixed(2)} yrs`}
      />
    </SimpleGrid>
  )
}

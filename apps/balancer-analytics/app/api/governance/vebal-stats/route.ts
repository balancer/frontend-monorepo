/**
 * veBAL aggregate stats — mainnet-only.
 *
 * Reads three numbers off the canonical contracts:
 *   - `veBAL.totalSupply()` — total voting power outstanding (1e18 units).
 *   - `veBalBpt.balanceOf(veBAL)` — total BAL-80/20 BPT locked. This is
 *     the underlying veBAL is minted against; the ratio of veBAL to BPT
 *     gives the system-wide average lock time multiplier.
 *   - `veBalBpt.totalSupply()` — BPT total supply, for context against
 *     the locked share.
 *
 * Three calls, one multicall, ~150 ms. Cached for 10 minutes via Next's
 * route revalidate since these tick on every new-lock / withdraw.
 */

import 'server-only'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { unstable_cache } from 'next/cache'
import type { Address } from 'viem'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { getPublicClient } from '@analytics/lib/drpc/client'
import { scrubError } from '@analytics/lib/drpc/scrub'

export const runtime = 'nodejs'
export const revalidate = 600

const ERC20_ABI = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export type VeBalStatsPayload = {
  /** Total veBAL voting power outstanding (18-decimal). */
  veBalTotalSupply: number | null
  /** Total BAL-80/20 BPT locked in the veBAL contract (18-decimal). */
  bptLocked: number | null
  /** Total BAL-80/20 BPT supply (18-decimal). Context line — "X% of BPT
   *  is in veBAL". */
  bptTotalSupply: number | null
  /** Implied average lock multiplier — `veBalTotalSupply / bptLocked`.
   *  Range is [0, 1]; 1.0 means everyone is locked for the full 1-year
   *  maximum. `null` when either input is missing. */
  averageLockMultiplier: number | null
  /** Approximate average lock duration in **years**, derived from the
   *  multiplier. veBAL's max lock is 1 year (not 4 like Curve's veCRV),
   *  so the multiplier maps 1:1 to years. */
  averageLockYears: number | null
  generatedAt: number
}

async function buildPayload(): Promise<VeBalStatsPayload> {
  const cfg = getNetworkConfig(GqlChainValues.Mainnet)
  const veBal = cfg.contracts.veBAL
  const bpt = cfg.tokens.addresses.veBalBpt
  if (!veBal || !bpt) {
    return {
      veBalTotalSupply: null,
      bptLocked: null,
      bptTotalSupply: null,
      averageLockMultiplier: null,
      averageLockYears: null,
      generatedAt: Math.floor(Date.now() / 1000),
    }
  }

  const client = getPublicClient(GqlChainValues.Mainnet)
  const results = await client.multicall({
    contracts: [
      {
        address: veBal as Address,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      },
      {
        address: bpt as Address,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [veBal as Address],
      },
      {
        address: bpt as Address,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      },
    ],
    allowFailure: true,
  })

  const human = (n: bigint | undefined): number | null =>
    n === undefined ? null : Number(n) / 1e18
  const veBalTotalSupply = results[0].status === 'success' ? human(results[0].result) : null
  const bptLocked = results[1].status === 'success' ? human(results[1].result) : null
  const bptTotalSupply = results[2].status === 'success' ? human(results[2].result) : null

  // `averageLockMultiplier ∈ [0, 1]` per the veBAL design — `veBAL` is
  // `BPT × locked_years / max_years`, summed across locks. The system-wide
  // ratio sounds like a derived constant but is genuinely informative:
  // it tells you whether holders typically lock for the max (close to 1)
  // or just dip in for the minimum (closer to 0).
  let averageLockMultiplier: number | null = null
  if (veBalTotalSupply !== null && bptLocked !== null && bptLocked > 0) {
    averageLockMultiplier = veBalTotalSupply / bptLocked
  }
  // veBAL max lock = 1 year (NOT 4 like veCRV — different from the Curve
  // template Balancer's contract is forked from). So the multiplier maps
  // directly to years.
  const averageLockYears = averageLockMultiplier

  if (results.some(r => r.status !== 'success')) {
    console.warn('[api/governance/vebal-stats] partial read', {
      veBalOk: results[0].status === 'success',
      bptLockedOk: results[1].status === 'success',
      bptSupplyOk: results[2].status === 'success',
      ...scrubError(results.find(r => r.status !== 'success')?.error),
    })
  }

  return {
    veBalTotalSupply,
    bptLocked,
    bptTotalSupply,
    averageLockMultiplier,
    averageLockYears,
    generatedAt: Math.floor(Date.now() / 1000),
  }
}

// Cache key bumped to `-v2` after fixing `averageLockYears` math
// (multiplier × 1 instead of × 4 — veBAL max lock is 1 year, not 4).
// Old cached payloads carried inflated lock-year values; this forces a
// fresh read so the UI doesn't keep showing "~3 years" until the next
// natural revalidate.
const getCachedPayload = unstable_cache(buildPayload, ['governance-vebal-stats-v2'], {
  revalidate: 600,
  tags: ['governance-vebal-stats-v2'],
})

export async function GET() {
  try {
    return Response.json(await getCachedPayload(), {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=1800',
      },
    })
  } catch (err) {
    const empty: VeBalStatsPayload = {
      veBalTotalSupply: null,
      bptLocked: null,
      bptTotalSupply: null,
      averageLockMultiplier: null,
      averageLockYears: null,
      generatedAt: Math.floor(Date.now() / 1000),
    }
    return Response.json(
      { ...empty, error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

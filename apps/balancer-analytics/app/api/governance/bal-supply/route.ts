/**
 * Naked BAL token supply per chain.
 *
 * Reads `totalSupply()` on each supported chain's BAL ERC20 contract — the
 * locally minted/bridged amount that the upcoming naked-BAL voting
 * strategy will be able to count toward voting power. Mainnet carries the
 * canonical issuance; every other chain's value is what's currently
 * bridged (via the LayerZero OFT and friends), so the per-chain shares
 * tell governance "where does the BAL we'd give votes to actually live?"
 *
 * Fan-out runs in parallel per-chain via the existing drpc client. Each
 * chain's read independently fails-soft to `null` so a single drpc hiccup
 * doesn't blank the whole panel. 10-min cache via Next's route
 * `revalidate` — supply ticks rarely (bridge mints, treasury moves).
 */

import 'server-only'
import { unstable_cache } from 'next/cache'
import type { Address } from 'viem'
import { getNetworkConfig } from '@repo/lib/config/app.config'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'
import { getPublicClient } from '@analytics/lib/drpc/client'
import { scrubError } from '@analytics/lib/drpc/scrub'

export const runtime = 'nodejs'
export const revalidate = 600

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

const ERC20_TOTAL_SUPPLY_ABI = [
  {
    type: 'function',
    name: 'totalSupply',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export type BalSupplyPoint = {
  chain: GqlChain
  /** Lowercased BAL token address on this chain — surfaced so the panel
   *  can build an explorer link without re-resolving the config. */
  address: string
  /** Raw `totalSupply` in token base units as a decimal string. `null`
   *  when the drpc read failed for this chain. */
  totalSupplyRaw: string | null
  /** Human-readable totalSupply (18-decimal BAL). `null` when the read
   *  failed. The client uses this directly; raw is just for forensics. */
  totalSupplyHuman: number | null
}

export type BalSupplyPayload = {
  points: BalSupplyPoint[]
  /** Sum of `totalSupplyHuman` across every chain that returned data.
   *  Excludes failed reads, so the displayed shares are normalised against
   *  the chains we actually measured (not against an artificially low
   *  total that includes nulls). */
  totalHuman: number
  generatedAt: number
}

function balAddress(chain: GqlChain): string | null {
  try {
    const cfg = getNetworkConfig(chain)
    const addr = cfg.tokens.addresses.bal
    if (!addr || addr.toLowerCase() === ZERO_ADDR) return null
    return addr.toLowerCase()
  } catch {
    return null
  }
}

async function readSupply(chain: GqlChain, address: string): Promise<bigint | null> {
  try {
    const client = getPublicClient(chain)
    const supply = await client.readContract({
      address: address as Address,
      abi: ERC20_TOTAL_SUPPLY_ABI,
      functionName: 'totalSupply',
    })
    return supply
  } catch (err) {
    console.warn('[api/governance/bal-supply] read failed', {
      chain,
      address,
      ...scrubError(err),
    })
    return null
  }
}

async function buildPayload(): Promise<BalSupplyPayload> {
  // Only chains that BOTH appear in `supportedNetworks` AND have a
  // configured BAL address. The drpc gate further filters chains we
  // don't have an RPC for (some testnets), so the panel doesn't display
  // rows we can never populate.
  const chains: { chain: GqlChain; address: string }[] = []
  for (const chain of PROJECT_CONFIG.supportedNetworks) {
    const address = balAddress(chain)
    if (!address) continue
    if (!isDrpcSupportedChain(chain)) continue
    chains.push({ chain, address })
  }

  const supplies = await Promise.all(
    chains.map(async ({ chain, address }) => {
      const raw = await readSupply(chain, address)
      return { chain, address, raw }
    })
  )

  let totalHuman = 0
  const points: BalSupplyPoint[] = supplies.map(({ chain, address, raw }) => {
    const human = raw === null ? null : Number(raw) / 1e18
    if (human !== null && Number.isFinite(human)) totalHuman += human
    return {
      chain,
      address,
      totalSupplyRaw: raw === null ? null : raw.toString(),
      totalSupplyHuman: human,
    }
  })

  // Sort descending by share — mainnet should always lead since canonical
  // BAL lives there, but the order isn't hardcoded in case a bridged
  // chain ever overshoots (shouldn't happen, but cheap to be honest).
  points.sort((a, b) => (b.totalSupplyHuman ?? 0) - (a.totalSupplyHuman ?? 0))

  return {
    points,
    totalHuman,
    generatedAt: Math.floor(Date.now() / 1000),
  }
}

const getCachedPayload = unstable_cache(buildPayload, ['governance-bal-supply'], {
  revalidate: 600,
  tags: ['governance-bal-supply'],
})

export async function GET() {
  try {
    return Response.json(await getCachedPayload(), {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=1800',
      },
    })
  } catch (err) {
    const empty: BalSupplyPayload = {
      points: [],
      totalHuman: 0,
      generatedAt: Math.floor(Date.now() / 1000),
    }
    return Response.json(
      { ...empty, error: String(err) },
      { status: 502, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}

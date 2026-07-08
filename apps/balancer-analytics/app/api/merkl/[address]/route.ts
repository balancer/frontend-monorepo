/**
 * Proxy Merkl's per-user rewards endpoint, fanned out across every chain
 * the analytics app supports. We hit Merkl server-side for two reasons:
 *  1. Avoid CORS / preflight overhead in the browser.
 *  2. One place to cache (10 min) and reshape the response — the client just
 *     consumes a flat array.
 *
 * Spec: https://api.merkl.xyz/v4/users/<address>/rewards?chainId=<id>
 * Merkl returns one envelope per chain; we sum into a single payload.
 */

import 'server-only'
import { NextResponse } from 'next/server'
import { isAddress } from 'viem'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getChainId } from '@repo/lib/config/app.config'

export const runtime = 'nodejs'
export const revalidate = 600

type MerklReward = {
  amount: string
  claimed: string
  pending: string
  token: {
    address: string
    chainId: number
    symbol: string
    decimals: number
    price?: number
  }
}

type MerklChainEnvelope = {
  chain: { id: number; name: string }
  rewards: MerklReward[]
}

export type AnalyticsMerklReward = {
  symbol: string
  tokenAddress: string
  chainId: number
  chainName: string
  decimals: number
  /** Token units still unclaimed (`amount - claimed`). May be 0. */
  unclaimed: number
  /** Token units in the pending-but-not-finalised bucket. May be 0. */
  pending: number
  /** USD value of `unclaimed`, when Merkl provides a price. Null if unknown. */
  unclaimedUsd: number | null
}

export type AnalyticsMerklPayload = {
  totalUnclaimedUsd: number
  rewards: AnalyticsMerklReward[]
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ address: string }> }
): Promise<NextResponse<AnalyticsMerklPayload | { error: string }>> {
  const { address: rawAddress } = await ctx.params
  if (!isAddress(rawAddress)) {
    return NextResponse.json({ error: 'invalid address' }, { status: 400 })
  }
  const address = rawAddress.toLowerCase()

  const chainIds = PROJECT_CONFIG.supportedNetworks
    .map(getChainId)
    .filter((id): id is number => typeof id === 'number')

  // Run all Merkl calls in parallel; tolerate per-chain failures so a single
  // bad chain doesn't black out the whole card.
  const settled = await Promise.allSettled(
    chainIds.map(async chainId => {
      const url = `https://api.merkl.xyz/v4/users/${address}/rewards?chainId=${chainId}`
      const res = await fetch(url, {
        next: { revalidate: 600 },
        headers: { accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`merkl ${chainId} → ${res.status}`)
      return (await res.json()) as MerklChainEnvelope[]
    })
  )

  const aggregated = new Map<string, AnalyticsMerklReward>()
  let totalUnclaimedUsd = 0

  for (const result of settled) {
    if (result.status === 'rejected') continue
    for (const envelope of result.value) {
      for (const reward of envelope.rewards) {
        const decimals = reward.token.decimals ?? 18
        const divisor = 10 ** decimals
        const unclaimedUnits = Math.max(
          0,
          (Number(reward.amount ?? 0) - Number(reward.claimed ?? 0)) / divisor
        )
        const pendingUnits = Math.max(0, Number(reward.pending ?? 0) / divisor)
        if (unclaimedUnits <= 0 && pendingUnits <= 0) continue

        const key = `${envelope.chain.id}:${reward.token.address.toLowerCase()}`
        const existing = aggregated.get(key) ?? {
          symbol: reward.token.symbol,
          tokenAddress: reward.token.address,
          chainId: envelope.chain.id,
          chainName: envelope.chain.name,
          decimals,
          unclaimed: 0,
          pending: 0,
          unclaimedUsd: null,
        }
        existing.unclaimed += unclaimedUnits
        existing.pending += pendingUnits
        const price = reward.token.price
        if (typeof price === 'number' && Number.isFinite(price)) {
          const usd = (existing.unclaimedUsd ?? 0) + unclaimedUnits * price
          existing.unclaimedUsd = usd
          // Track running total only for rewards with a price; otherwise the
          // header would silently undercount mismatched-price tokens.
          totalUnclaimedUsd += unclaimedUnits * price
        }
        aggregated.set(key, existing)
      }
    }
  }

  const rewards = Array.from(aggregated.values()).sort((a, b) => {
    const usdDiff = (b.unclaimedUsd ?? 0) - (a.unclaimedUsd ?? 0)
    if (usdDiff !== 0) return usdDiff
    return b.unclaimed - a.unclaimed
  })

  return NextResponse.json({ totalUnclaimedUsd, rewards })
}

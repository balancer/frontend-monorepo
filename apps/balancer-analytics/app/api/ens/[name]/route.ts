/**
 * Resolve an ENS name to a checksummed mainnet address. Used by the
 * portfolio address input so power users can paste `vitalik.eth` instead
 * of `0xd8dA…`. Cached aggressively (24h) because ENS forward resolution
 * rarely changes day-to-day and we want to absorb traffic spikes from
 * shared portfolio URLs.
 */

import 'server-only'
import { NextResponse } from 'next/server'
import { createPublicClient, http, isAddress } from 'viem'
import { mainnet } from 'viem/chains'
import { normalize } from 'viem/ens'

export const runtime = 'nodejs'
export const revalidate = 86400

type Resolution = { address: string | null }

const RPC_URL = process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com'

// Module-scope client — Next.js route handlers reuse the module across
// invocations, so the underlying fetch agent stays warm.
const client = createPublicClient({
  chain: mainnet,
  transport: http(RPC_URL),
})

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ name: string }> }
): Promise<NextResponse<Resolution>> {
  const { name: raw } = await ctx.params
  const decoded = decodeURIComponent(raw).trim().toLowerCase()
  if (!decoded.endsWith('.eth')) {
    return NextResponse.json({ address: null }, { status: 400 })
  }
  let normalized: string
  try {
    normalized = normalize(decoded)
  } catch {
    return NextResponse.json({ address: null }, { status: 400 })
  }
  try {
    const address = await client.getEnsAddress({ name: normalized })
    if (!address || !isAddress(address)) {
      return NextResponse.json({ address: null }, { status: 404 })
    }
    return NextResponse.json({ address })
  } catch {
    // Upstream RPC failure — surface as 502 so the client can prompt the
    // user to try again rather than caching a null forever at the edge.
    return NextResponse.json({ address: null }, { status: 502 })
  }
}

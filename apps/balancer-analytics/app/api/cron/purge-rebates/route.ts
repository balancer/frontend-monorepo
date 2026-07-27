/**
 * One-off cleanup: physically delete CoW-settlement fee "rebate" rows that an
 * earlier indexing config wrote into `pool_param_events`.
 *
 * Background:
 *   Balancer V2 pools on CoW's MEV-capturing flow have their swap fee lowered
 *   and then restored inside a single settlement tx. Both writes emit
 *   `SwapFeePercentageChanged`, so the index recorded fee "changes" that never
 *   altered the pool config. The live pipeline now strips these at decode time
 *   and on every read (see `lib/pool-events/cow-rebate.ts`), so they no longer
 *   surface — but the historical rows still sit in the table. This route
 *   removes them.
 *
 * Detection (matches the read-time filter for real data):
 *   A rebate = two-or-more `SwapFeePercentageChanged` for the same
 *   (chain, pool_address, tx_hash). A pool's logs for one tx all live in one
 *   block, so a round-trip pair is always co-located; ≥2-in-a-tx is the
 *   signature. We delete every row in such a group. Scoped to
 *   `protocol_version = 2` — the CoW fee-discount flow is V2-only.
 *
 * Caveat (intentionally NOT addressed here):
 *   On busy pools the old V2 row cap may have evicted genuine Gauntlet fee
 *   changes before they were ever stored. Purging rebates does NOT recover
 *   those — only a forced cold rescan (`?refresh` / `?fullHistory`) re-walks
 *   the chain with the decode-time filter active. This route is purge-only by
 *   the operator's choice.
 *
 * Shape:
 *   POST /api/cron/purge-rebates
 *   Authorization: Bearer $CRON_SECRET
 *   Body:
 *     {
 *       "execute": false,          // default false = dry run (count only)
 *       "pools": ["0x..."]         // optional; 42-char addresses or 66-char
 *                                  // V2 poolIds. Omit to scan ALL V2 pools.
 *     }
 *
 *   Dry run returns the per-pool breakdown of rows that WOULD be deleted.
 *   `execute: true` performs the delete and returns the deleted count.
 *
 * Idempotent: re-running after a successful purge deletes nothing (no group
 * has ≥2 fee rows left).
 */

import 'server-only'
import { ensureSchemaOnce, sql } from '@analytics/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function unauthorized() {
  return Response.json({ error: 'unauthorized' }, { status: 401 })
}

type PoolBreakdown = { chain: string; pool_address: string; rows: number }

/**
 * Normalize a user-supplied pool identifier to the lowercased 20-byte address
 * stored in `pool_param_events`. Accepts a 42-char address (V3 canonical id /
 * any pool address) or a 66-char V2 poolId (address is its first 20 bytes).
 * Returns null for anything that isn't one of those shapes.
 */
function toPoolAddress(input: string): string | null {
  const s = input.trim().toLowerCase()
  if (/^0x[0-9a-f]{40}$/.test(s)) return s
  if (/^0x[0-9a-f]{64}$/.test(s)) return s.slice(0, 42)
  return null
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  let execute = false
  let poolInputs: string[] = []
  try {
    const body = (await req.json()) as { execute?: unknown; pools?: unknown }
    execute = body?.execute === true
    if (Array.isArray(body?.pools)) {
      poolInputs = body.pools.filter((p): p is string => typeof p === 'string')
    }
  } catch {
    // No / invalid body → dry run over all V2 pools.
  }

  // Resolve the optional pool scope. Reject up front if any id is malformed so
  // we never silently purge a wider-than-intended set.
  const addresses: string[] = []
  const invalid: string[] = []
  for (const p of poolInputs) {
    const addr = toPoolAddress(p)
    if (addr) addresses.push(addr)
    else invalid.push(p)
  }
  if (invalid.length > 0) {
    return Response.json(
      { error: 'invalid pool identifiers (need a 42-char address or 66-char poolId)', invalid },
      { status: 400 }
    )
  }
  // `scopeAll = true` when no pools were supplied → match every V2 pool. When
  // pools are supplied it's false and the `ANY(addresses)` filter applies.
  const scopeAll = addresses.length === 0

  await ensureSchemaOnce()

  // Per-pool breakdown of the rows that match the rebate signature. Computed
  // up front so the dry run can preview and the execute path can report what
  // it removed.
  const breakdownRows = (await sql`
    SELECT chain, pool_address, count(*)::int AS rows
    FROM pool_param_events
    WHERE event_name = 'SwapFeePercentageChanged'
      AND protocol_version = 2
      AND (${scopeAll} OR pool_address = ANY(${addresses}))
      AND (chain, pool_address, tx_hash) IN (
        SELECT chain, pool_address, tx_hash
        FROM pool_param_events
        WHERE event_name = 'SwapFeePercentageChanged'
          AND protocol_version = 2
          AND (${scopeAll} OR pool_address = ANY(${addresses}))
        GROUP BY chain, pool_address, tx_hash
        HAVING count(*) >= 2
      )
    GROUP BY chain, pool_address
    ORDER BY rows DESC
  `) as PoolBreakdown[]

  const candidateRows = breakdownRows.reduce((sum, r) => sum + r.rows, 0)
  const scope = scopeAll ? 'all-v2' : `${addresses.length} pool(s)`

  if (!execute) {
    return Response.json(
      {
        mode: 'dry-run',
        scope,
        poolsAffected: breakdownRows.length,
        rowsToDelete: candidateRows,
        breakdown: breakdownRows,
        note: 'Re-POST with {"execute": true} to delete. This does not recover genuine fee changes the V2 cap may have evicted — force-rescan affected pools for that.',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const deleted = (await sql`
    DELETE FROM pool_param_events
    WHERE event_name = 'SwapFeePercentageChanged'
      AND protocol_version = 2
      AND (${scopeAll} OR pool_address = ANY(${addresses}))
      AND (chain, pool_address, tx_hash) IN (
        SELECT chain, pool_address, tx_hash
        FROM pool_param_events
        WHERE event_name = 'SwapFeePercentageChanged'
          AND protocol_version = 2
          AND (${scopeAll} OR pool_address = ANY(${addresses}))
        GROUP BY chain, pool_address, tx_hash
        HAVING count(*) >= 2
      )
    RETURNING id
  `) as { id: number }[]

  console.info('[purge-rebates] deleted rebate rows', {
    scope,
    poolsAffected: breakdownRows.length,
    rowsDeleted: deleted.length,
  })

  return Response.json(
    {
      mode: 'execute',
      scope,
      poolsAffected: breakdownRows.length,
      rowsDeleted: deleted.length,
      breakdown: breakdownRows,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

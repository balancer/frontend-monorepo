/**
 * Manual TVL row importer — gap-fills the protocol_snapshots series with
 * hand-curated daily values (typically pulled from Dune when DefiLlama is
 * missing a window).
 *
 * Why this exists:
 *   The DefiLlama `balancer-v2` adapter occasionally drops days (e.g. the
 *   2026-02-19 → 2026-03-01 v2 outage). The hourly api-v3 cron doesn't write
 *   V2/V3 breakdowns (BPT double-count problem), so the only way to fill is
 *   to paste numbers in directly.
 *
 * Shape:
 *   POST /api/cron/import-manual
 *   Authorization: Bearer $CRON_SECRET
 *   Body:
 *     {
 *       "rows": [
 *         { "day": "2026-02-19", "version": 2, "tvl": 76604756.01 },
 *         ...
 *       ],
 *       "force": false   // optional; overwrites existing manual rows
 *     }
 *
 *   `day`     — YYYY-MM-DD, interpreted as midnight UTC
 *   `version` — 1 (CoW AMM), 2 (Balancer v2), 3 (Balancer v3)
 *   `tvl`     — total liquidity in USD
 *
 * Each row writes ONE breakdown row at chain='ALL'. We don't touch CORE/ALL —
 * the chart computes its headline from `v2 + v3 + cow` so the manual rows
 * surface immediately without a DB-side re-aggregation step.
 *
 * Conflict policy: gap-fill only. In default mode we UPDATE total_liquidity
 * iff the existing row has `total_liquidity = 0` — this is the case for
 * DefiLlama V2 rows during the upstream outage windows (DefiLlama's DEX
 * volume/fees adapters write a row even when the protocol TVL adapter is
 * missing, leaving TVL at 0). Non-zero TVL rows are never clobbered.
 * `force: true` overwrites *any* existing row's total_liquidity.
 */

import 'server-only'
import {
  ensureSchemaOnce,
  sql,
  AGGREGATE_KEY,
  PROTOCOL_V2,
  PROTOCOL_V3,
  PROTOCOL_COW_AMM,
  SOURCE_MANUAL,
  type Protocol,
} from '@analytics/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY_S = 24 * 60 * 60

const VERSION_TO_PROTOCOL: Record<number, Protocol> = {
  1: PROTOCOL_COW_AMM,
  2: PROTOCOL_V2,
  3: PROTOCOL_V3,
}

type InputRow = { day: string; version: number; tvl: number }

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

function badRequest(message: string) {
  return Response.json({ ok: false, error: message }, { status: 400 })
}

function parseDayToUnixSeconds(day: string): number | null {
  // Accept YYYY-MM-DD or full ISO. Always interpret as UTC midnight.
  const ymd = /^\d{4}-\d{2}-\d{2}$/.test(day) ? `${day}T00:00:00Z` : day
  const ms = Date.parse(ymd)
  if (Number.isNaN(ms)) return null
  return Math.floor(ms / 1000 / DAY_S) * DAY_S
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()

  let body: { rows?: InputRow[]; force?: boolean }
  try {
    body = await req.json()
  } catch {
    return badRequest('invalid JSON body')
  }
  const rows = body?.rows
  if (!Array.isArray(rows) || rows.length === 0) {
    return badRequest('body.rows must be a non-empty array')
  }
  const force = !!body.force

  await ensureSchemaOnce()

  const accepted: { ts: number; protocol: Protocol; tvl: number }[] = []
  const rejected: { row: InputRow; reason: string }[] = []

  for (const r of rows) {
    const ts = parseDayToUnixSeconds(r.day)
    if (ts === null) {
      rejected.push({ row: r, reason: 'invalid day' })
      continue
    }
    const protocol = VERSION_TO_PROTOCOL[r.version]
    if (!protocol) {
      rejected.push({ row: r, reason: `unknown version ${r.version}` })
      continue
    }
    const tvl = Number(r.tvl)
    if (!Number.isFinite(tvl) || tvl < 0) {
      rejected.push({ row: r, reason: 'invalid tvl' })
      continue
    }
    accepted.push({ ts, protocol, tvl })
  }

  if (accepted.length === 0) {
    return Response.json({ ok: false, accepted: 0, rejected }, { status: 400 })
  }

  await sql.transaction(
    accepted.map(({ ts, protocol, tvl }) => {
      if (force) {
        return sql`
          INSERT INTO protocol_snapshots (
            ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
            yield_capture_24h, surplus_24h, pool_count, num_lps, source
          ) VALUES (
            ${ts}, ${AGGREGATE_KEY}, ${protocol}, ${tvl}, 0, 0, 0, 0, 0, 0, ${SOURCE_MANUAL}
          )
          ON CONFLICT (ts, chain, protocol) DO UPDATE SET
            total_liquidity = EXCLUDED.total_liquidity,
            source          = ${SOURCE_MANUAL},
            captured_at     = now()
        `
      }
      // Gap-fill: insert if missing; if a placeholder row exists with
      // total_liquidity = 0 (e.g. DefiLlama wrote volume but no TVL), patch it.
      return sql`
        INSERT INTO protocol_snapshots (
          ts, chain, protocol, total_liquidity, swap_volume_24h, swap_fee_24h,
          yield_capture_24h, surplus_24h, pool_count, num_lps, source
        ) VALUES (
          ${ts}, ${AGGREGATE_KEY}, ${protocol}, ${tvl}, 0, 0, 0, 0, 0, 0, ${SOURCE_MANUAL}
        )
        ON CONFLICT (ts, chain, protocol) DO UPDATE SET
          total_liquidity = EXCLUDED.total_liquidity,
          source          = ${SOURCE_MANUAL},
          captured_at     = now()
        WHERE protocol_snapshots.total_liquidity = 0
      `
    })
  )

  return Response.json({
    ok: true,
    force,
    accepted: accepted.length,
    rejected,
    ranAt: new Date().toISOString(),
  })
}

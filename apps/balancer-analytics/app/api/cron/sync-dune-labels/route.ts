/**
 * Weekly Dune label sync.
 *
 * GET /api/cron/sync-dune-labels  — Vercel cron (Authorization: Bearer ${CRON_SECRET})
 * POST                            — manual trigger (same auth) for ad-hoc reruns
 *
 * Walks every page of Dune query 3004790, normalizes each row (chain
 * mapping, category inference from name, slug-based source id), and
 * upserts into `dune_address_labels`. Idempotent — re-running against
 * the same Dune snapshot rewrites the same rows.
 *
 * The query has a Dune-side cached execution (~3-month TTL), so weekly
 * runs hit the cache and burn no Dune credits unless the snapshot
 * expires.
 */

import 'server-only'
import {
  ensureSchemaOnce,
  getDuneLabelStats,
  upsertDuneLabels,
  type DuneLabelInsert,
} from '@analytics/lib/db'
import { fetchAllDuneLabels } from '@analytics/lib/dune/fetch-labels'
import { normalizeDuneRow } from '@analytics/lib/dune/normalize'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

function unauthorized() {
  return new Response('Unauthorized', { status: 401 })
}

async function run(): Promise<Response> {
  await ensureSchemaOnce()
  const started = Date.now()
  let pages = 0
  let raw = 0
  const normalized: DuneLabelInsert[] = []
  const skipped: Record<string, number> = { chain: 0, address: 0 }

  try {
    const result = await fetchAllDuneLabels()
    pages = result.pages
    raw = result.rows.length

    for (const row of result.rows) {
      const n = normalizeDuneRow(row)
      if (!n) {
        // Track WHY a row got dropped so the sync's response surfaces it.
        if (typeof row.blockchain === 'string') skipped.chain += 1
        else skipped.address += 1
        continue
      }
      normalized.push({
        chain: n.chain,
        address: n.address,
        sourceId: n.sourceId,
        name: n.name,
        category: n.category,
      })
    }

    const { written } = await upsertDuneLabels(normalized)
    const stats = await getDuneLabelStats()

    return Response.json({
      ok: true,
      durationMs: Date.now() - started,
      pages,
      fetched: raw,
      normalized: normalized.length,
      written,
      skipped,
      total: stats.total,
      byCategory: stats.byCategory,
      byChain: stats.byChain,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[cron/sync-dune-labels] failed', { pages, raw, normalizedCount: normalized.length, message })
    return Response.json(
      {
        ok: false,
        durationMs: Date.now() - started,
        pages,
        fetched: raw,
        normalized: normalized.length,
        error: message,
      },
      { status: 502 }
    )
  }
}

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()
  return run()
}

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return unauthorized()
  return run()
}

/**
 * Paginated fetch of Dune query 3004790 (named DEX router/contract
 * addresses across chains). The cron route calls this once per scheduled
 * tick; results are upserted into `dune_address_labels`.
 *
 * Pagination: Dune's REST API returns at most ~1000 rows per page and a
 * `next_uri` link for the next chunk. We follow `next_uri` until it
 * disappears — that handles both today's ~7k-row dataset and any future
 * growth without us hard-coding offsets.
 *
 * The query has a cached execution (TTL ~3 months on the Dune side), so
 * weekly cron runs hit the cache and consume zero Dune credits unless
 * the snapshot has expired.
 */

import 'server-only'

const DUNE_QUERY_ID = 3004790
const PAGE_LIMIT = 1000
/** Per-page timeout. Dune responses are typically <500ms but a cold
 *  cache miss can stretch into the seconds. Hard cap so a stuck request
 *  doesn't block the whole cron. */
const PAGE_TIMEOUT_MS = 30_000
/** Safety stop in case `next_uri` somehow loops. 50 pages × 1000 rows
 *  is 50k rows of headroom over today's 6.9k. */
const HARD_PAGE_CAP = 50

export type DuneLabelRowRaw = {
  address: string
  name: string
  blockchain: string
}

type DuneResponse = {
  result?: {
    rows?: DuneLabelRowRaw[]
    metadata?: { total_row_count?: number }
  }
  next_uri?: string
  error?: unknown
}

async function fetchPage(url: string, apiKey: string): Promise<DuneResponse> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      headers: { 'x-dune-api-key': apiKey },
      signal: controller.signal,
      cache: 'no-store',
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`dune HTTP ${res.status} ${body.slice(0, 200)}`)
    }
    return (await res.json()) as DuneResponse
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Walk every page of the query result. Returns the raw rows; the caller
 * is responsible for `normalizeDuneRow`-ing and persisting.
 */
export async function fetchAllDuneLabels(): Promise<{
  rows: DuneLabelRowRaw[]
  pages: number
}> {
  const apiKey = process.env.NEXT_PRIVATE_DUNE_API_KEY
  if (!apiKey) throw new Error('NEXT_PRIVATE_DUNE_API_KEY is not set')

  const rows: DuneLabelRowRaw[] = []
  let nextUrl: string | null = `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results?limit=${PAGE_LIMIT}`
  let pages = 0
  while (nextUrl && pages < HARD_PAGE_CAP) {
    pages += 1
    const data: DuneResponse = await fetchPage(nextUrl, apiKey)
    if (data.error) {
      throw new Error(`dune error: ${JSON.stringify(data.error).slice(0, 200)}`)
    }
    const page = data.result?.rows ?? []
    if (page.length === 0) break
    rows.push(...page)
    nextUrl = data.next_uri ?? null
  }
  return { rows, pages }
}

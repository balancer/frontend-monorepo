/**
 * veBAL holder distribution — Dune query 601405.
 *
 * Returns the latest snapshot of who holds veBAL, including the full
 * wallet address per row so the UI can link out to a block explorer.
 * Named protocols (Aura, Tetu, Stake DAO, Humpy, Gnosis DAO) carry a
 * friendly `provider` label; unlabeled whales appear with a truncated
 * address as their `provider`. Rows look like:
 *
 *   | day                 | wallet_address | provider | vebal_balance | pct |
 *   | 2026-06-05 00:00:00 | 0xaf52…bec2    | Aura     | 3300778       | 0.70 |
 *   | 2026-06-05 00:00:00 | 0x4281…bc93    | 0x4281…bc93 | 123072    | 0.03 |
 *
 * The Dune query carries historical rows for many days; we filter to the
 * latest `day` only — the widget shows the current distribution, not a
 * timeline. Cached on the Dune side already, so the cron-style weekly
 * cache here (server route) means at most one credit-billing call per
 * week per environment.
 */

import 'server-only'

const DUNE_QUERY_ID = 601405
/** Generous upper-bound — the query returns ~10 rows per day, so 500
 *  covers ~50 days of history without missing the freshest snapshot. */
const PAGE_LIMIT = 500
const TIMEOUT_MS = 30_000

export type VeBalHolderRowRaw = {
  day: string
  wallet_address: string | null
  provider: string | null
  vebal_balance: number | string | null
  pct: number | string | null
}

export type VeBalHolderRow = {
  /** Provider label as it appears in the query — named protocols (Aura,
   *  Humpy, …) carry a friendly name; unlabeled whales fall back to a
   *  truncated form of their own address. */
  provider: string
  /** Full lowercase wallet address from the query. Used for the
   *  explorer link on every row (named providers included, since
   *  knowing Aura's locker address is useful in its own right). */
  walletAddress: string
  /** Absolute veBAL voting power held by this provider on the latest
   *  snapshot day. Coerced to number — Dune sometimes returns numbers as
   *  strings depending on the column type. */
  veBalBalance: number
  /** Share of total veBAL voting power, in `[0, 1]`. */
  pct: number
}

export type VeBalHoldersSnapshot = {
  /** ISO-ish snapshot day used to filter the Dune rows. Useful as a
   *  "as-of" caption on the UI. */
  day: string
  rows: VeBalHolderRow[]
}

type DuneResponse = {
  result?: {
    rows?: VeBalHolderRowRaw[]
  }
  error?: unknown
}

function toNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

/**
 * Read the latest cached results for query 3645067 and return the
 * distribution for the most recent day. We hit `/results` (NOT
 * `/execute` + `/status`) so the call resolves in <500ms against Dune's
 * cache without spending a credit when the snapshot hasn't changed.
 */
export async function fetchVeBalHoldersSnapshot(): Promise<VeBalHoldersSnapshot> {
  const apiKey = process.env.NEXT_PRIVATE_DUNE_API_KEY
  if (!apiKey) throw new Error('NEXT_PRIVATE_DUNE_API_KEY is not set')

  const url = `https://api.dune.com/api/v1/query/${DUNE_QUERY_ID}/results?limit=${PAGE_LIMIT}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  let data: DuneResponse
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
    data = (await res.json()) as DuneResponse
  } finally {
    clearTimeout(timer)
  }
  if (data.error) {
    throw new Error(`dune error: ${JSON.stringify(data.error).slice(0, 200)}`)
  }
  const raw = data.result?.rows ?? []
  if (raw.length === 0) {
    return { day: '', rows: [] }
  }

  // Pick the latest day present in the result set — string compare works
  // on Dune's `YYYY-MM-DD HH:MM:SS` format (ISO lexicographic order).
  let latestDay = ''
  for (const r of raw) {
    if (typeof r.day === 'string' && r.day > latestDay) latestDay = r.day
  }

  const rows: VeBalHolderRow[] = raw
    .filter(r => r.day === latestDay)
    .map(r => ({
      provider: r.provider ?? '—',
      walletAddress: (r.wallet_address ?? '').toLowerCase(),
      veBalBalance: toNumber(r.vebal_balance),
      pct: toNumber(r.pct),
    }))
    .sort((a, b) => b.pct - a.pct)

  return { day: latestDay, rows }
}

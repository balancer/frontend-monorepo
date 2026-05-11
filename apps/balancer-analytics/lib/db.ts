/**
 * Postgres client + schema bootstrap for the protocol snapshotter.
 *
 * Backed by Vercel's Neon Postgres integration — the marketplace add-on
 * injects `DATABASE_URL` (and `POSTGRES_URL` as an alias) at runtime. The
 * `@neondatabase/serverless` driver gives us a tagged-template `sql` helper
 * for typed queries plus `sql.query(text, params)` for one-shot parameterised
 * statements (used by the multi-row upsert).
 *
 * `ensureSchema()` is self-healing: it runs on every cron tick so a fresh
 * deploy doesn't need a manual migration step. `CREATE TABLE IF NOT EXISTS`
 * is a no-op once the table is there.
 */

import 'server-only'
import { neon } from '@neondatabase/serverless'

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!dbUrl) {
  throw new Error(
    'DATABASE_URL (or POSTGRES_URL) is missing. Provision Neon via the Vercel Marketplace and the env var is injected automatically.'
  )
}

export const sql = neon(dbUrl)

export const AGGREGATE_KEY = 'ALL' as const

/**
 * One DB row. Aggregate-across-all-chains rows use `chain = 'ALL'`; per-chain
 * rows use the `GqlChain` enum name (`'MAINNET'`, `'ARBITRUM'`, ...).
 */
export type SnapshotRow = {
  ts: number
  chain: string
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLps: number
}

export async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS protocol_snapshots (
      ts                BIGINT           NOT NULL,
      chain             TEXT             NOT NULL,
      total_liquidity   DOUBLE PRECISION NOT NULL,
      swap_volume_24h   DOUBLE PRECISION NOT NULL,
      swap_fee_24h      DOUBLE PRECISION NOT NULL,
      yield_capture_24h DOUBLE PRECISION NOT NULL,
      surplus_24h       DOUBLE PRECISION NOT NULL,
      pool_count        INTEGER          NOT NULL,
      num_lps           INTEGER          NOT NULL,
      captured_at       TIMESTAMPTZ      NOT NULL DEFAULT now(),
      PRIMARY KEY (ts, chain)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_protocol_snapshots_ts ON protocol_snapshots (ts DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_protocol_snapshots_chain_ts ON protocol_snapshots (chain, ts DESC)`
}

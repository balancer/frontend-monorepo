/**
 * Postgres client + schema bootstrap for the protocol snapshotter.
 *
 * Backed by Vercel's Neon Postgres integration — the marketplace add-on
 * injects `DATABASE_URL` (and `POSTGRES_URL` as an alias) at runtime. The
 * `@neondatabase/serverless` driver gives us a tagged-template `sql` helper
 * for typed queries plus `sql.transaction([...])` for batched writes.
 *
 * Rows are keyed by `(ts, chain, protocol)`:
 *   - `chain = 'ALL'` for the cross-chain aggregate, otherwise a `GqlChain`.
 *   - `protocol = 'CORE'` mirrors api-v3's `protocolMetricsAggregated`
 *     (which already includes CoW AMM in its numbers). `protocol = 'COW_AMM'`
 *     is a *breakdown of* CORE, tracked separately so charts can split it
 *     out — never sum CORE + COW_AMM, that double-counts.
 *
 * `ensureSchema()` is self-healing: idempotent CREATE for fresh deploys,
 * idempotent ALTERs to migrate an earlier 2-column-PK table.
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

export const PROTOCOL_CORE = 'CORE' as const
export const PROTOCOL_V2 = 'V2' as const
export const PROTOCOL_V3 = 'V3' as const
export const PROTOCOL_COW_AMM = 'COW_AMM' as const
export type Protocol =
  | typeof PROTOCOL_CORE
  | typeof PROTOCOL_V2
  | typeof PROTOCOL_V3
  | typeof PROTOCOL_COW_AMM

export const SOURCE_API = 'api-v3' as const
export const SOURCE_DEFILLAMA = 'defillama' as const
export type SnapshotSource = typeof SOURCE_API | typeof SOURCE_DEFILLAMA

/**
 * One DB row. Aggregate-across-all-chains rows use `chain = 'ALL'`; per-chain
 * rows use the `GqlChain` enum name (`'MAINNET'`, `'ARBITRUM'`, ...).
 */
export type SnapshotRow = {
  ts: number
  chain: string
  protocol: Protocol
  totalLiquidity: number
  swapVolume24h: number
  swapFee24h: number
  yieldCapture24h: number
  surplus24h: number
  poolCount: number
  numLps: number
  source: SnapshotSource
}

export async function ensureSchema(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS protocol_snapshots (
      ts                BIGINT           NOT NULL,
      chain             TEXT             NOT NULL,
      protocol          TEXT             NOT NULL DEFAULT 'CORE',
      total_liquidity   DOUBLE PRECISION NOT NULL,
      swap_volume_24h   DOUBLE PRECISION NOT NULL,
      swap_fee_24h      DOUBLE PRECISION NOT NULL,
      yield_capture_24h DOUBLE PRECISION NOT NULL,
      surplus_24h       DOUBLE PRECISION NOT NULL,
      pool_count        INTEGER          NOT NULL,
      num_lps           INTEGER          NOT NULL,
      source            TEXT             NOT NULL DEFAULT 'api-v3',
      captured_at       TIMESTAMPTZ      NOT NULL DEFAULT now(),
      PRIMARY KEY (ts, chain, protocol)
    )
  `
  // Migration path: a table created before the CORE/COW_AMM split has neither
  // the new columns nor the 3-col PK. Add columns idempotently then rebuild
  // the PK only if it doesn't already include `protocol`.
  await sql`ALTER TABLE protocol_snapshots ADD COLUMN IF NOT EXISTS protocol TEXT NOT NULL DEFAULT 'CORE'`
  await sql`ALTER TABLE protocol_snapshots ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'api-v3'`
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.key_column_usage
        WHERE constraint_name = 'protocol_snapshots_pkey'
          AND column_name = 'protocol'
      ) THEN
        ALTER TABLE protocol_snapshots DROP CONSTRAINT IF EXISTS protocol_snapshots_pkey;
        ALTER TABLE protocol_snapshots ADD PRIMARY KEY (ts, chain, protocol);
      END IF;
    END $$;
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_protocol_snapshots_ts ON protocol_snapshots (ts DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_protocol_snapshots_chain_ts ON protocol_snapshots (chain, ts DESC)`
  await sql`CREATE INDEX IF NOT EXISTS idx_protocol_snapshots_protocol_ts ON protocol_snapshots (protocol, ts DESC)`
}

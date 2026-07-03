/**
 * Postgres client + schema bootstrap for the protocol snapshotter.
 *
 * Backed by Vercel's Neon Postgres integration — the marketplace add-on
 * injects `DATABASE_URL` / `POSTGRES_URL` at runtime. When the integration
 * is mounted under a custom prefix (e.g. "DATABASE"), the vars come through
 * prefixed (`DATABASE_POSTGRES_URL`); we accept both shapes here so the
 * deploy works regardless of which way the Vercel project is wired up.
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

// Try each naming convention the Vercel Neon Marketplace add-on can emit,
// in priority order. `DATABASE_URL` / `POSTGRES_URL` are the bare defaults;
// the `DATABASE_`-prefixed variants come from a project that mounted the
// integration under a "DATABASE" prefix.
const dbUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL ||
  process.env.DATABASE_POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL_UNPOOLED
if (!dbUrl) {
  throw new Error(
    'No Postgres connection string found. Set DATABASE_URL / POSTGRES_URL, or wire the Vercel Neon Marketplace integration (which also provides DATABASE_POSTGRES_URL).'
  )
}

export const sql = neon(dbUrl)

// ── Per-op structured logging ──────────────────────────────────────────────
// Each Neon HTTP roundtrip emits one log line of `{ op, helper, ms }`. Post-
// deploy the only lines should be `op: 'write'` at cron cadence (~1/hr) and
// the pool-page read pair (`getPoolSyncState`, `getPoolParamEvents`) capped
// at one per (chain, pool) per `SYNC_TTL_SECONDS`. Anything else on a
// sub-minute timer is a regression and worth chasing.
type DbOp = 'read' | 'write' | 'ddl'

async function trackDbOp<T>(op: DbOp, helper: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now()
  try {
    const result = await fn()
    console.info('[db]', { op, helper, ms: Date.now() - start, ok: true })
    return result
  } catch (err) {
    console.warn('[db]', { op, helper, ms: Date.now() - start, ok: false, err: String(err) })
    throw err
  }
}

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
export const SOURCE_MANUAL = 'manual' as const
export type SnapshotSource =
  | typeof SOURCE_API
  | typeof SOURCE_DEFILLAMA
  | typeof SOURCE_MANUAL

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

// `ensureSchema` runs ~13 idempotent DDL statements. That's a *huge* share
// of the per-request DB roundtrip count on routes that called it on every
// hit (the events route used to). `ensureSchemaOnce` memoizes the result
// per warm function instance so cold-start pays the DDL cost once, and
// every subsequent request inside that instance pays zero. The schema is
// idempotent, so re-running on the next cold start is also safe — we just
// don't want to pay 13 round trips per request when the table already exists.
let schemaPromise: Promise<void> | null = null
export function ensureSchemaOnce(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = ensureSchema().catch(err => {
      // Reset on failure so the next call retries — better than wedging the
      // route in a permanently-broken state on a transient DB hiccup.
      schemaPromise = null
      throw err
    })
  }
  return schemaPromise
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

  // ── Pool parameter event timeline (lazy-fetched on pool-page visit) ──
  // One row per decoded param-change event for a single pool. UNIQUE
  // constraint on (chain, pool_address, block_number, log_index) makes
  // INSERTs idempotent — the tail-sync can safely re-process an overlapping
  // range without producing duplicates.
  await sql`
    CREATE TABLE IF NOT EXISTS pool_param_events (
      id               BIGSERIAL    PRIMARY KEY,
      chain            TEXT         NOT NULL,
      pool_address     TEXT         NOT NULL,
      protocol_version SMALLINT     NOT NULL,
      block_number     BIGINT       NOT NULL,
      block_timestamp  BIGINT       NOT NULL,
      log_index        INT          NOT NULL,
      tx_hash          TEXT         NOT NULL,
      event_name       TEXT         NOT NULL,
      args             JSONB        NOT NULL,
      captured_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
      UNIQUE (chain, pool_address, block_number, log_index)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_pool_param_events_pool ON pool_param_events (chain, pool_address, block_number)`
  await sql`CREATE INDEX IF NOT EXISTS idx_pool_param_events_pool_event ON pool_param_events (chain, pool_address, event_name)`

  // ── Per-pool sync watermark ──
  // Tracks last successfully-synced block and the wall-clock time of the last
  // sync attempt. Used to (a) compute the next `fromBlock` for tail-sync and
  // (b) skip the RPC roundtrip when `last_synced_at` is within the TTL.
  await sql`
    CREATE TABLE IF NOT EXISTS pool_sync_state (
      chain          TEXT         NOT NULL,
      pool_address   TEXT         NOT NULL,
      last_block     BIGINT       NOT NULL,
      last_synced_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
      PRIMARY KEY (chain, pool_address)
    )
  `
  // `deep_synced` records that a one-time full-history scan (from the
  // pool's deployment block, not the 90-day cap) has completed for this
  // pool. Once true, a `?fullHistory` visit is served from the DB on the
  // normal warm path instead of re-walking the whole chain every time.
  // Idempotent ALTER so existing deploys migrate in place.
  await sql`ALTER TABLE pool_sync_state ADD COLUMN IF NOT EXISTS deep_synced BOOLEAN NOT NULL DEFAULT false`

  // ── Per-tx `tx.to` cache (used by PoolOrderFlow) ──
  // api-v3 returns `tx.from` (an EOA) in the swap event's `sender` field —
  // not the immediate Vault caller. To label by the actual entry contract
  // (1inch Router, CoW Settlement, Balancer Router, named MEV bot, etc.),
  // we fetch each swap tx's `to` field from drpc and cache it here.
  // Rows are written lazily — top-N highest-USD uncached txs per request.
  // `to_address` is nullable for contract-creation txs (where tx.to is null),
  // but in practice swap txs always have a `to`. Keyed by `(chain, tx_hash)`.
  await sql`
    CREATE TABLE IF NOT EXISTS swap_tx_metadata (
      chain       TEXT         NOT NULL,
      tx_hash     TEXT         NOT NULL,
      to_address  TEXT,
      fetched_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
      PRIMARY KEY (chain, tx_hash)
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_swap_tx_metadata_to
    ON swap_tx_metadata (chain, to_address)
    WHERE to_address IS NOT NULL
  `

  // ── Dune-sourced address label dictionary ──
  // Bulk-fetched periodically from Dune query 3004790 (~7k rows across all
  // chains). Lives alongside the manually-curated `labels/direct.ts` dict
  // and feeds the order-flow label cascade as a second tier (manual wins).
  // Categorization is inferred client-side from the `name` field since the
  // Dune query only exposes (address, name, blockchain).
  await sql`
    CREATE TABLE IF NOT EXISTS dune_address_labels (
      chain      TEXT         NOT NULL,
      address    TEXT         NOT NULL,
      source_id  TEXT         NOT NULL,
      name       TEXT         NOT NULL,
      category   TEXT         NOT NULL,
      fetched_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
      PRIMARY KEY (chain, address)
    )
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_dune_labels_category ON dune_address_labels (chain, category)`
}

// ── pool_param_events helpers ──────────────────────────────────────────────

export type PoolParamEventRow = {
  chain: string
  poolAddress: string
  protocolVersion: number
  blockNumber: number
  blockTimestamp: number
  logIndex: number
  txHash: string
  eventName: string
  args: Record<string, unknown>
}

export async function getPoolParamEvents(
  chain: string,
  poolAddress: string
): Promise<PoolParamEventRow[]> {
  const rows = await trackDbOp(
    'read',
    'getPoolParamEvents',
    () => sql`
      SELECT
        chain,
        pool_address,
        protocol_version,
        block_number,
        block_timestamp,
        log_index,
        tx_hash,
        event_name,
        args
      FROM pool_param_events
      WHERE chain = ${chain} AND pool_address = ${poolAddress.toLowerCase()}
      ORDER BY block_number ASC, log_index ASC
    `
  )
  return (rows as Record<string, unknown>[]).map(r => ({
    chain: r.chain as string,
    poolAddress: r.pool_address as string,
    protocolVersion: Number(r.protocol_version),
    blockNumber: Number(r.block_number),
    blockTimestamp: Number(r.block_timestamp),
    logIndex: Number(r.log_index),
    txHash: r.tx_hash as string,
    eventName: r.event_name as string,
    args: (r.args ?? {}) as Record<string, unknown>,
  }))
}

/**
 * Cheap existence check for a pool's persisted timeline. Used by the sync
 * to detect the "poisoned watermark" state — a `pool_sync_state` row whose
 * `last_block` advanced past real events while zero rows were ever captured
 * (e.g. a sync that ran before a pool type's Filter B was wired). Such a
 * pool can never self-heal on the warm `watermark + 1` path, so the sync
 * falls back to a cold-range rescan when this returns 0.
 */
export async function countPoolParamEvents(
  chain: string,
  poolAddress: string
): Promise<number> {
  const rows = await trackDbOp(
    'read',
    'countPoolParamEvents',
    () => sql`
      SELECT count(*)::int AS n
      FROM pool_param_events
      WHERE chain = ${chain} AND pool_address = ${poolAddress.toLowerCase()}
    `
  )
  return Number((rows as Record<string, unknown>[])[0]?.n ?? 0)
}

export async function insertPoolParamEvents(
  rows: readonly PoolParamEventRow[]
): Promise<void> {
  if (rows.length === 0) return
  // neon-serverless `sql` helper doesn't support multi-row VALUES tuples
  // through tagged-template params, so we batch via `sql.transaction([...])`
  // with one parameterized statement per row. INSERT ... ON CONFLICT keeps
  // re-runs idempotent against the (chain, pool, block, log_index) UNIQUE.
  const statements = rows.map(
    r => sql`
      INSERT INTO pool_param_events (
        chain, pool_address, protocol_version,
        block_number, block_timestamp, log_index,
        tx_hash, event_name, args
      ) VALUES (
        ${r.chain},
        ${r.poolAddress.toLowerCase()},
        ${r.protocolVersion},
        ${r.blockNumber},
        ${r.blockTimestamp},
        ${r.logIndex},
        ${r.txHash.toLowerCase()},
        ${r.eventName},
        ${JSON.stringify(r.args)}::jsonb
      )
      ON CONFLICT (chain, pool_address, block_number, log_index) DO NOTHING
    `
  )
  await trackDbOp('write', `insertPoolParamEvents[n=${rows.length}]`, () =>
    sql.transaction(statements)
  )
}

// ── pool_sync_state helpers ────────────────────────────────────────────────

export type PoolSyncState = {
  chain: string
  poolAddress: string
  lastBlock: number
  lastSyncedAt: Date
  /** A full-history scan (from the deployment block) has completed for this
   *  pool. `?fullHistory` then serves from the DB instead of re-scanning. */
  deepSynced: boolean
}

export async function getPoolSyncState(
  chain: string,
  poolAddress: string
): Promise<PoolSyncState | null> {
  const rows = await trackDbOp(
    'read',
    'getPoolSyncState',
    () => sql`
      SELECT chain, pool_address, last_block, last_synced_at, deep_synced
      FROM pool_sync_state
      WHERE chain = ${chain} AND pool_address = ${poolAddress.toLowerCase()}
      LIMIT 1
    `
  )
  const r = (rows as Record<string, unknown>[])[0]
  if (!r) return null
  return {
    chain: r.chain as string,
    poolAddress: r.pool_address as string,
    lastBlock: Number(r.last_block),
    lastSyncedAt: new Date(r.last_synced_at as string),
    deepSynced: r.deep_synced === true,
  }
}

/**
 * Upsert the per-pool watermark. `markDeepSynced` is monotonic — passing
 * `true` latches `deep_synced` on (a completed full-history scan), passing
 * `false` (the default, for normal tail-syncs) preserves whatever it was.
 * It never flips back to false.
 */
export async function upsertPoolSyncState(
  chain: string,
  poolAddress: string,
  lastBlock: number,
  markDeepSynced = false
): Promise<void> {
  await trackDbOp(
    'write',
    'upsertPoolSyncState',
    () => sql`
      INSERT INTO pool_sync_state (chain, pool_address, last_block, last_synced_at, deep_synced)
      VALUES (${chain}, ${poolAddress.toLowerCase()}, ${lastBlock}, now(), ${markDeepSynced})
      ON CONFLICT (chain, pool_address) DO UPDATE
        SET last_block = EXCLUDED.last_block,
            last_synced_at = now(),
            deep_synced = pool_sync_state.deep_synced OR EXCLUDED.deep_synced
    `
  )
}

// ── swap_tx_metadata helpers ───────────────────────────────────────────────

/** Bulk-read tx.to for a set of tx hashes. Returns a map keyed by lowercased
 *  tx hash. Hashes that have never been enriched are simply absent — callers
 *  treat absence as "schedule for enrichment". */
export async function getSwapTxMetadata(
  chain: string,
  txHashes: readonly string[]
): Promise<Map<string, string | null>> {
  if (txHashes.length === 0) return new Map()
  const normalized = txHashes.map(h => h.toLowerCase())
  const rows = await trackDbOp(
    'read',
    `getSwapTxMetadata[n=${normalized.length}]`,
    () => sql`
      SELECT tx_hash, to_address
      FROM swap_tx_metadata
      WHERE chain = ${chain} AND tx_hash = ANY(${normalized})
    `
  )
  const out = new Map<string, string | null>()
  for (const r of rows as Record<string, unknown>[]) {
    out.set(r.tx_hash as string, (r.to_address as string | null) ?? null)
  }
  return out
}

export type SwapTxMetadataInsert = {
  txHash: string
  toAddress: string | null
}

export async function upsertSwapTxMetadata(
  chain: string,
  rows: readonly SwapTxMetadataInsert[]
): Promise<void> {
  if (rows.length === 0) return
  const statements = rows.map(
    r => sql`
      INSERT INTO swap_tx_metadata (chain, tx_hash, to_address, fetched_at)
      VALUES (
        ${chain},
        ${r.txHash.toLowerCase()},
        ${r.toAddress ? r.toAddress.toLowerCase() : null},
        now()
      )
      ON CONFLICT (chain, tx_hash) DO UPDATE
        SET to_address = EXCLUDED.to_address,
            fetched_at = now()
    `
  )
  await trackDbOp('write', `upsertSwapTxMetadata[n=${rows.length}]`, () =>
    sql.transaction(statements)
  )
}

// ── dune_address_labels helpers ────────────────────────────────────────────

export type DuneLabel = {
  sourceId: string
  name: string
  category: string
}

/** Bulk-read Dune labels for a set of addresses. Returned map keys are
 *  lowercased addresses. Used by the order-flow route to feed the
 *  cascade's Dune tier. */
export async function getDuneLabels(
  chain: string,
  addresses: readonly string[]
): Promise<Map<string, DuneLabel>> {
  if (addresses.length === 0) return new Map()
  const normalized = addresses.map(a => a.toLowerCase())
  const rows = await trackDbOp(
    'read',
    `getDuneLabels[n=${normalized.length}]`,
    () => sql`
      SELECT address, source_id, name, category
      FROM dune_address_labels
      WHERE chain = ${chain} AND address = ANY(${normalized})
    `
  )
  const out = new Map<string, DuneLabel>()
  for (const r of rows as Record<string, unknown>[]) {
    out.set(r.address as string, {
      sourceId: r.source_id as string,
      name: r.name as string,
      category: r.category as string,
    })
  }
  return out
}

export type DuneLabelInsert = {
  chain: string
  address: string
  sourceId: string
  name: string
  category: string
}

/** Bulk-upsert Dune labels. Each row is keyed by (chain, address) — re-running
 *  the sync against the same Dune snapshot is idempotent. Batched in
 *  ~500-row chunks because Neon's HTTP driver has a parameter cap. */
export async function upsertDuneLabels(
  rows: readonly DuneLabelInsert[]
): Promise<{ written: number }> {
  if (rows.length === 0) return { written: 0 }
  const CHUNK = 500
  let written = 0
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const statements = chunk.map(
      r => sql`
        INSERT INTO dune_address_labels (chain, address, source_id, name, category, fetched_at)
        VALUES (
          ${r.chain},
          ${r.address.toLowerCase()},
          ${r.sourceId},
          ${r.name},
          ${r.category},
          now()
        )
        ON CONFLICT (chain, address) DO UPDATE
          SET source_id = EXCLUDED.source_id,
              name = EXCLUDED.name,
              category = EXCLUDED.category,
              fetched_at = now()
      `
    )
    await trackDbOp('write', `upsertDuneLabels[chunk=${chunk.length}]`, () =>
      sql.transaction(statements)
    )
    written += chunk.length
  }
  return { written }
}

/** Total count + per-category breakdown. Used by the cron route to log
 *  a one-line summary so we can verify a sync landed correctly. */
export async function getDuneLabelStats(): Promise<{
  total: number
  byChain: Record<string, number>
  byCategory: Record<string, number>
}> {
  const rows = await trackDbOp('read', 'getDuneLabelStats', () => sql`
    SELECT chain, category, count(*)::int AS n FROM dune_address_labels GROUP BY chain, category
  `)
  const stats = { total: 0, byChain: {} as Record<string, number>, byCategory: {} as Record<string, number> }
  for (const r of rows as Record<string, unknown>[]) {
    const chain = r.chain as string
    const category = r.category as string
    const n = Number(r.n)
    stats.total += n
    stats.byChain[chain] = (stats.byChain[chain] ?? 0) + n
    stats.byCategory[category] = (stats.byCategory[category] ?? 0) + n
  }
  return stats
}

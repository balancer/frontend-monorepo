# Protocol snapshotter

api-v3 exposes only point-in-time protocol metrics (`protocolMetricsAggregated` and its per-chain
`chains[]` subselection). The smol subgraphs deliberately ship no snapshot entities and have no
USD-denominated swap fields, so client-side aggregation isn't viable. The v2 `BalancerSnapshot`
source is being decommissioned and post-Nov 5 2025 data is corrupted.

So: we run our own snapshotter. Every hour, write the current values (aggregate + per-chain) to
Postgres. The series grows forward from the first cron run — there's nothing to backfill because the
upstream API has no history to walk.

## Architecture (Tier 2: Postgres)

We skipped the JSON-blob "Tier 1" approach from the original design doc and went straight to
Postgres because the operational model (Vercel cron → Postgres → Next route handler) is exactly what
we already run for the Hyperliquid dashboard, and we know it works.

```
                   ┌──────────────────────────────────────────┐
                   │       Vercel cron — hourly (UTC top)     │
                   └──────────────────┬───────────────────────┘
                                      │ GET /api/cron/snapshot
                                      │ Authorization: Bearer ${CRON_SECRET}
                                      ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  one GraphQL call: protocolMetricsAggregated(chains: [...])    │
   │    returns aggregate + chains[] in a single payload            │
   └──────────────────┬─────────────────────────────────────────────┘
                      │
                      │ ~11 rows / tick (1 aggregate + ~10 active chains)
                      ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ Postgres (Neon, via Vercel Marketplace integration)            │
   │ table: protocol_snapshots (ts, chain, ...)                     │
   │ PK (ts, chain) → re-runs upsert the same row idempotently      │
   └──────────────────┬─────────────────────────────────────────────┘
                      │
                      │ GET /api/snapshots?days=N (revalidate: 600s)
                      ▼
   ┌────────────────────────────────────────────────────────────────┐
   │ useProtocolSnapshots() → useTvlSeries() etc.                   │
   └────────────────────────────────────────────────────────────────┘
```

## Files

- `types.ts` — `ProtocolSnapshotPoint` / `ProtocolSnapshotSeries` (the wire shape returned by
  `/api/snapshots`).
- `useProtocolSnapshots.ts` — reader hook; fetches `/api/snapshots`.
- `../db.ts` — Neon client + `ensureSchema()`.
- `../../app/api/cron/snapshot/route.ts` — hourly writer.
- `../../app/api/snapshots/route.ts` — public read endpoint.
- `../../vercel.json` — cron schedule (`0 * * * *`, UTC).

## Setup

1. Provision Postgres via Vercel → project → Storage → Marketplace → Neon. `DATABASE_URL` (and
   `POSTGRES_URL` alias) is injected automatically.
2. Add `CRON_SECRET` to project env vars (any random string; `openssl rand -hex 32`).
3. Deploy. The cron starts firing at the top of the next UTC hour.
4. Optional — force a first write before the cron fires:
   ```
   curl https://<deployment>/api/cron/snapshot \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

## Notes

- **Hourly cadence requires Vercel Pro.** Hobby tier caps crons at daily. If we're on Hobby, change
  the schedule to `0 0 * * *` and accept daily granularity.
- **Aggregate vs per-chain rows live in one table**, keyed on `chain = 'ALL'` for aggregate, the
  `GqlChain` enum name for per-chain rows. Same shape, same indexes — simpler than two tables.
- **No retention pruning.** 11 rows/hour × 8760 hours/year ≈ 96k rows/year. Neon handles this
  comfortably forever; if storage ever becomes a concern we can add a `WHERE ts < ?` `DELETE` to the
  cron.
- **Unknown chains are skipped, not folded into the aggregate.** If api-v3 starts returning a
  `chainId` we don't know in `@repo/lib`'s networks table, the cron response lists it under
  `skipped` so we can spot it and add the mapping.

## Out of scope

- User-level positions (DeBank covers this).
- Pool-level snapshots — already in api-v3 via `poolGetSnapshots`.
- Token prices — already in api-v3 via `tokenGetHistoricalPrices`.
- True hourly volume _deltas_ (per-hour swap volume rather than rolling 24h). api-v3 only exposes
  rolling-24h windows; computing real per-hour totals would mean aggregating `poolEvents` per chain
  per hour, which is expensive and the v3 vault `-smol` subgraphs don't carry USD on swap events.
  Punted unless a use case demands it.

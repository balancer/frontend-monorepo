# Pool Order Flow — Implementation Plan

Visualize **where swap volume for a pool comes from** (1inch, CowSwap, MEV bots, Balancer-direct, …) as a Sankey diagram on the pool detail page.

This document is part build-log, part reference. Phases 1–5 are the original v1 build (kept verbatim with checkboxes for posterity). Phases 6–7 cover the iterative improvements that landed afterwards: a single-window fetch architecture, `tx.to` enrichment via dRPC, the contributor-drill-down modal, two new source categories, and the weekly Dune label sync.

---

## Current state (shipped)

**Visible on the pool page:**
- 3-column Sankey: `Source → Token In → Token Out`. Link width = USD volume, link color = source category. Source nodes colored by category, token nodes neutral, token symbols rendered with circular icons.
- Range toggle: `24h / 7d / 30d` (default 7d) — **filters in-memory**, never refetches.
- 7 source categories: `aggregator`, `intent`, `direct`, `mev_bot`, `market_maker`, `bridge`, `unknown`.
- **Click any node or link** → centered modal listing the contributing senders with full address, USD share, swap count, copy-to-clipboard button, Etherscan link.
- Min-USD dust filter (hardcoded $100 — keeps probe-and-revert MEV artifacts out of aggregation).
- Long-tail Unknown handling: per-sender unknowns with ≥ $10k cumulative USD get split into their own Sankey node (top 15); everything below stays in the generic "Unknown" bucket.
- "Other" rollup for labeled sources below 0.5% share (`unknown` is never rolled up — it's the curation-backlog signal).
- Empty state for <10 swaps; **CowAmm pools skip the card entirely**.

**Server-side:**
- Server fetches **30d** of swaps once per pool per 10-min CDN window (capped at 10,000 swaps, ~16 days on a hot pool). Client filters down to 24h/7d as needed.
- Two enrichment caches:
  - `swap_tx_metadata` — `tx.to` per tx hash (looked up via dRPC, lazy, top-100 unlabeled per request)
  - `dune_address_labels` — bulk labels (~7k rows) populated weekly by `/api/cron/sync-dune-labels`
- 6-tier label cascade: CowAmm typename → static dict on tx.to → Dune on tx.to → static dict on sender → Dune on sender → Unknown.

**Deferred / not built:**
- Click-through filtering of `PoolEventLog` from Sankey selection.
- Surplus-bias view for CowAmm pools.
- A second "behavior view" (Direction A↔B) toggle.
- Min-USD slider in the UI (the builder supports it, just no control).
- Vitest infrastructure for the analytics app (unit-test files for builders/cascades are deferred).

**Removed (built then deleted):**
- Etherscan-driven deployer enrichment + the cascade tier that consumed it. Etherscan's `getcontractcreation` returns no data for the unverified contracts and EOAs we actually needed to label, so the path was producing 0 useful rows. Phase 6.4 already had pivoted away from it; a follow-up cleanup pass removed the dead module, the `swap_source_metadata` table from `ensureSchema`, the `DeployerCache` type, the empty `by-deployer.ts` scaffold, and the `NEXT_PRIVATE_ETHERSCAN_API_KEY` env declaration. A future deployer-family redesign would need a different data source + fresh cache anyway.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  PoolPageView (server component)                                     │
│    ├─ PoolHistoryChart                                               │
│    ├─ PoolOrderFlow ← NEW                                            │
│    │    ├─ Header (range toggle, swap count, volume, labeled %)      │
│    │    ├─ CategoryLegend (non-zero categories only)                 │
│    │    ├─ PoolOrderFlowSankey (ECharts)                             │
│    │    └─ PoolOrderFlowDetailsModal (click-through drill-down)      │
│    ├─ PoolStatePanel                                                 │
│    └─ PoolEventLog                                                   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼  fetch()
                /api/pool/[chain]/[id]/order-flow         (no range param;
                              │                            always 30d, client filters)
        ┌─────────────────────┼─────────────────────────────┐
        ▼                     ▼                             ▼
  api-v3 GetPoolEvents   swap_tx_metadata               labelSwapSource()
  (swaps + sender)       (Postgres cache, per tx.to)    6-tier cascade
                              ▲                             ▲
                              │                             │
                       drpc eth_getTransactionByHash    dune_address_labels
                       (top-100 unlabeled per req)      (Postgres cache, ~7k rows)
                                                            ▲
                                                            │  weekly cron
                                                            │
                                            /api/cron/sync-dune-labels
                                                            │
                                                            ▼
                                                  Dune query 3004790
                                                  (Authorization: x-dune-api-key)
```

### File layout

```
apps/balancer-analytics/
├─ docs/pool-order-flow.md                              ← this plan
├─ vercel.json                                          ← weekly Dune cron (Phase 7)
├─ scripts/probe-swap-sources.mjs                       ← label-curation tool
├─ lib/
│  ├─ db.ts                                             ← 2 tables: swap_tx_metadata,
│  │                                                       dune_address_labels
│  ├─ drpc/
│  │  └─ tx-info.ts                                     ← tx.to enrichment via viem (Phase 6)
│  └─ dune/
│     ├─ fetch-labels.ts                                ← paginated Dune client (Phase 7)
│     └─ normalize.ts                                   ← blockchain/name → GqlChain/category/id
├─ app/
│  ├─ api/
│  │  ├─ pool/[chain]/[id]/order-flow/route.ts          ← main route (always 30d)
│  │  └─ cron/sync-dune-labels/route.ts                 ← weekly Dune sync (Phase 7)
│  └─ pool/[chain]/[id]/_components/PoolOrderFlow/
│     ├─ PoolOrderFlow.tsx                              ← parent card, selection state
│     ├─ PoolOrderFlowSankey.tsx                        ← ECharts wrapper, emit onSelect
│     ├─ PoolOrderFlowDetailsModal.tsx                  ← contributor drill-down (Phase 6)
│     ├─ usePoolOrderFlowData.ts                        ← fetch hook (no range arg)
│     ├─ buildSankeyGraph.ts                            ← pure aggregator (+ split / rollup)
│     ├─ types.ts                                       ← SourceCategory, SourceLabel, LabeledSwap
│     ├─ api-types.ts                                   ← OrderFlowResponse shape
│     ├─ format.ts                                      ← colors, formatters, brand aliases
│     └─ labels/
│        ├─ index.ts                                    ← labelSwapSource cascade (6 tiers)
│        └─ direct.ts                                   ← curated static labels (mainnet + monad)

packages/lib/shared/services/api/pool.graphql           ← `sender` on swap fragments (Phase 1)
```

---

## Phases

### Phase 1 — Data plumbing

Goal: get `sender` into the generated GraphQL types, and have a Postgres table ready to cache deployer lookups.

- [x] **1.1** Add `sender` to the `GqlPoolSwapEventV3` fragment in `packages/lib/shared/services/api/pool.graphql:231`
- [x] **1.2** Add `sender` to the `GqlPoolSwapEventCowAmm` fragment same file `:241`
- [x] **1.3** Re-run codegen: `pnpm --filter @repo/lib graphql:gen && pnpm --filter balancer-analytics graphql:gen`
- [x] **1.4** Verify `GetPoolEventsQuery['poolEvents'][n]` (V3 variant) now exposes `sender: string` in `packages/lib/shared/services/api/generated/graphql.ts` (confirmed at line 3022)
- [x] **1.5** Add `swap_source_metadata` table to `ensureSchema()` in `apps/balancer-analytics/lib/db.ts`:

  ```sql
  CREATE TABLE IF NOT EXISTS swap_source_metadata (
    chain        TEXT NOT NULL,
    address      TEXT NOT NULL,
    deployer     TEXT,
    is_contract  BOOLEAN NOT NULL,
    fetched_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (chain, address)
  );
  ```

- [x] **1.6** Add helpers in `lib/db.ts`:
  - `getSwapSourceMetadata(chain, addresses: string[])`
  - `upsertSwapSourceMetadata(chain, rows: { address, deployer, isContract }[])`

**Acceptance**: codegen passes; typecheck passes; `ensureSchema()` creates the table without conflicts. ✅

---

### Phase 2 — Labels & cascade

Goal: pure-data layer that classifies a swap into a source category. No I/O.

- [x] **2.1** `…/PoolOrderFlow/types.ts`: `SourceCategory`, `SourceLabel`, `LabeledSwap`, `DeployerCache`, `LabelsByChain`.
- [x] **2.2** `…/PoolOrderFlow/labels/direct.ts`: Dune list verbatim + CowSwap GPv2 Settlement + 2 manually-identified MEV bots.
- [x] **2.3** `…/PoolOrderFlow/labels/by-deployer.ts`: empty scaffold.
- [x] **2.4** `…/PoolOrderFlow/labels/index.ts`: `labelSwapSource` cascade.
- [~] **2.5** Unit tests deferred — no test runner in the analytics app; behavioral verification via Phase 3 smoke-test against real api-v3 data.

**Acceptance**: typecheck + lint pass ✅. (Cascade signature has since been extended in Phases 6–7.)

### Side fix (Phase 2)
- `apps/balancer-analytics/eslint.config.js` — Node-globals override for `scripts/**/*.{js,mjs}`.

---

### Phase 3 — API route & deployer enrichment

Goal: server route that returns labeled+aggregated Sankey data; lazy enrichment of unknown senders.

- [x] **3.1** `NEXT_PRIVATE_ETHERSCAN_API_KEY` in `.env.template` and `turbo.json` `globalEnv`.
- [x] **3.2** `apps/balancer-analytics/lib/etherscan/contract-creation.ts`:
  - Batches of 5 per Etherscan v2 call, 4s timeout per batch, returns seeded map. Soft-fails when key unset.
- [x] **3.3** `apps/balancer-analytics/app/api/pool/[chain]/[id]/order-flow/route.ts`:
  - **Initial design** (replaced in Phase 6): `range ∈ {24h, 7d, 30d}` query param, paginated api-v3 fetch (200/page, cap 5000), Etherscan deployer enrichment of top-10 unknown senders.
- [x] **3.4** Smoke-tested against four pool scenarios.

**Acceptance**: ✅ All scenarios pass. (Architectural pivot in Phase 6 — server stopped accepting `range` and moved to single-window fetch.)

### Side fixes (Phase 3)
- `turbo.json` — added `NEXT_PRIVATE_ETHERSCAN_API_KEY` to `globalEnv`.

---

### Phase 4 — Sankey graph builder

Goal: pure function that turns labeled swaps into ECharts Sankey nodes+links.

- [x] **4.1** `…/PoolOrderFlow/buildSankeyGraph.ts`:
  - Pure function, no React/server imports.
  - 3-column layout with explicit `depth` (0/1/2).
  - Node naming: `src:<id>` / `tin:<addr>` / `tout:<addr>`.
  - `tin→tout` links keyed *also* by `sourceCategory`.
  - "Other" rollup for labeled sources < `otherThresholdPct`; `unknown` never rolled up.
  - (Phase 6 added) Per-sender unknown-split feature: senders ≥ `unknownSplitThresholdUsd` ($10k) get their own synthetic `unknown:<addr>` node, capped at top 15.
  - (Phase 6 added) `categoryShare` populated for every `SourceCategory` (zero-valued where absent).
  - (Phase 6 added) Exposes `splitUnknownSenders` and `rolledUpSourceIds` sets so the details modal can resolve which raw swaps belong to which node.
- [~] **4.2** Unit tests deferred.

**Acceptance**: typecheck + lint pass ✅. Function is deterministic and pure.

---

### Phase 5 — UI integration

Goal: render the Sankey card on the pool page.

- [x] **5.1** `usePoolOrderFlowData.ts`: plain `fetch + useState + useEffect` hook. (Range-aware initially; Phase 6 stripped the `range` arg.)
- [x] **5.2** `PoolOrderFlowSankey.tsx`: ECharts wrapper. CATEGORY_COLORS, custom HTML tooltips for nodes and edges.
- [x] **5.3** `PoolOrderFlow.tsx`: card with header, range toggle, legend, body.
- [x] **5.4** Mounted in `PoolPageView.tsx` between `PoolHistoryChart` and `PoolStatePanel`.
- [x] **5.5** Conditional: skip render for `poolDetail.type === 'COW_AMM'`.
- [x] **5.6** Empty state: < 10 swaps.
- [x] **5.7** Dev-server smoke verified across multiple pools.

**Acceptance**: typecheck + lint pass ✅. All pool pages return 200.

### Side fixes (Phase 5)
- `OrderFlowRange` + `OrderFlowResponse` extracted to `api-types.ts` so client code doesn't pull in `'server-only'`.

---

### Phase 6 — Iteration & polish

Caught real-usage issues and architectural mismatches against `frontend-v3`. Each sub-item is a discrete fix with its own commit-shaped rationale.

- [x] **6.1 Bigger pages, bigger windows.** `PAGE_SIZE` 200 → 500 (`PoolActivityChart` uses 500 — confirmed safe under api-v3's per-request cap). `HARD_CAP` 5000 → 10000 so 30d covers ~16 days on hot pools instead of ~8.
- [x] **6.2 Single-window fetch, client-side range filter.** Server stopped accepting `?range=`; always returns 30d. The hook fetches once per pool; the component filters `data.swaps` by timestamp via `useMemo` on range toggle. Mirrors `frontend-v3`'s `usePoolActivity` strategy.
  - **Why**: rapid range toggling was tripping api-v3 IP-rate-limits in seconds (25 paginated calls per click × 2 clicks = 50 requests). Single fetch + in-memory filter eliminates the spam.
  - **AbortController**: hook aborts the in-flight request on pool/chain change to prevent stacking parallel api-v3 calls.
- [x] **6.3 Resilient pagination.** `fetchSwaps` catches mid-stream api-v3 failures and returns partial results (with a `truncated` flag) instead of 502'ing the whole route. Dev-mode 502 responses include the actual upstream error in the body.
- [x] **6.4 Switched the enrichment target.** Etherscan deployer enrichment was returning 0 useful rows because it was querying `sender` addresses — which **are EOAs** in api-v3's surfacing (not contracts as originally assumed). Replaced with `tx.to` enrichment via dRPC.
  - **The pivotal discovery**: api-v3's `sender` field on V3 swap events is `tx.from` (the EOA), not the immediate Vault caller. Aggregator-routed flow (1inch, CoW, etc.) was invisible because the EOA isn't labelable. `tx.to` — the outermost contract called by the tx — is the right signal for "who routed this trade?".
  - New table: `swap_tx_metadata(chain, tx_hash, to_address, fetched_at)`.
  - New module: `lib/drpc/tx-info.ts` — viem `getTransaction` with `pLimit(12)` concurrency + per-chain p-limit gate.
  - Enrichment priority: **unlabeled txs by USD** (skip txs whose sender is already in the static dict — those wouldn't benefit). Top-100 per request.
  - Etherscan code stays in the tree; the cascade tier still exists for a future redesign that queries deployers of `tx.to` contracts.
- [x] **6.5 Unknown-split for big addresses.** Unknown-category senders whose per-period USD ≥ $10k get their own `src:unknown:<addr>` node (top 15 by USD). Empirical: the GHO pool has 213 such senders; capping at 15 keeps the diagram readable while the long tail rolls up into generic Unknown.
- [x] **6.6 Two new source categories.** `market_maker` (purple `#6c4add`) and `bridge` (amber `#fbbf24`). Widened `SourceCategory`, `ALL_CATEGORIES`, `LEGEND_ORDER`, `CATEGORY_COLORS`, `formatCategory`. Also added the discriminated `MainnetLabel` / `MonadLabel` types in `direct.ts` so per-chain label tables can keep their category list tight.
- [x] **6.7 Token icons + label clipping.** Per-node ECharts `label.rich` for token nodes with `logoURI` (16px circular icon + symbol). Right margin 80 → 160. Long symbols (e.g., "Aave Prime GHO") truncate to 16 chars with `…`. Tooltips show the untruncated symbol.
- [x] **6.8 Explicit Sankey container height.** `flex="1" minH="360px"` collapsed to 100px because the card stands alone in the page-level column (no flex anchor from a sibling tile, unlike `PoolHistoryChart`). Hardcoded `h={{ base: '420px', md: '480px' }}` instead.
- [x] **6.9 Click-through drill-down modal.** `PoolOrderFlowDetailsModal.tsx`. The Sankey now emits `onSelect({ kind: 'node' | 'edge', … })` instead of copying addresses on click. The modal computes contributors via a predicate against raw swap data (accounting for unknown-split + Other-rollup decisions exposed from the builder). Each row: full address, USD share, swap count, Chakra `useClipboard` + toast, Etherscan link.
- [x] **6.10 Side label additions.** Manual entries to `direct.ts`:
  - Mainnet: 2 market makers, 3 additional 1inch routers, the rETH-pool MEV bot
  - Monad: 1 MEV/flashbot, 1 Across bridge, 1 LFJ aggregator (first non-mainnet entries)

**Acceptance**: typecheck + lint pass ✅. Empirical coverage on GHO pool: **0% aggregator → 4.3% aggregator + 1.3% intent + 0.1% direct** once tx.to enrichment lands (was 100% MEV/Unknown when label-by-sender only).

---

### Phase 7 — Weekly Dune label sync

Goal: replace one-shot manual label imports with an automated weekly sync of Dune query 3004790 (~7k labeled addresses across 8 chains). The static `direct.ts` becomes the curated short list; Dune becomes the long-tail dictionary.

- [x] **7.1** New table `dune_address_labels` in `ensureSchema()`:
  ```sql
  CREATE TABLE IF NOT EXISTS dune_address_labels (
    chain      TEXT         NOT NULL,
    address    TEXT         NOT NULL,
    source_id  TEXT         NOT NULL,
    name       TEXT         NOT NULL,
    category   TEXT         NOT NULL,
    fetched_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (chain, address)
  );
  CREATE INDEX IF NOT EXISTS idx_dune_labels_category
    ON dune_address_labels (chain, category);
  ```
  Helpers: `getDuneLabels`, `upsertDuneLabels` (chunked at 500 rows for Neon HTTP), `getDuneLabelStats`.
- [x] **7.2** `lib/dune/fetch-labels.ts`: paginated walk via `next_uri` (follows Dune's link rel pattern rather than hard-coded offsets). 30s per-page timeout, hard cap 50 pages of headroom.
- [x] **7.3** `lib/dune/normalize.ts`:
  - `duneChainToGqlChain('ethereum' | 'arbitrum' | …)` → `GqlChain` (unsupported chains skipped).
  - `nameToSourceId(name)`: brand alias table maps "1Inch" / "1inch" → `1inch`, "Li.Fi" / "LiFi" → `lifi`, "TraderJoe" → `lfj`, etc. — so Dune entries collapse into the same Sankey node as `direct.ts` siblings. Slug fallback for unknown brands.
  - `nameToCategory(name)`: pattern-matched categorization. MEV match comes first (Dune has 6569 "Arbitrage Bot" rows; we collapse them into `mev_bot`). Then bridges (LayerZero / Stargate / Across / …), intent venues (CowSwap / UniswapX / Bebop), market makers (`mm$|wintermute|…`), Balancer direct (`^balancer`). Defaults to `aggregator`.
- [x] **7.4** `app/api/cron/sync-dune-labels/route.ts`:
  - `GET` for Vercel cron, `POST` for ad-hoc — both gated by `Authorization: Bearer ${CRON_SECRET}`.
  - Walks all pages, normalizes, upserts. Returns a JSON summary (pages, fetched, normalized, written, skipped, per-chain + per-category breakdown).
  - `maxDuration = 300` for headroom against Dune cache-expiry re-execution.
- [x] **7.5** `vercel.json` — added `0 3 * * 1` (Mondays 03:00 UTC, after the hourly snapshot cron).
- [x] **7.6** `NEXT_PRIVATE_DUNE_API_KEY` declared in `.env.template` and `turbo.json` `globalEnv`.
- [x] **7.7** Cascade extension in `labels/index.ts`:
  - New `DuneLabelCache` type.
  - Cascade reorganized to its current 6-tier form: CowAmm typename → static dict[tx.to] → **Dune[tx.to]** → static dict[sender] → **Dune[sender]** → Unknown.
  - Manual curation still wins; Dune fills the gap.
  - (Initially shipped with a 7th deployer-family tier; that tier was removed in the post-Dune cleanup pass since the underlying `swap_source_metadata` cache was being populated by an Etherscan path that didn't work for the data we had.)
- [x] **7.8** Route integration: route loads Dune labels for the union of all distinct senders + tx.to values per request, passes the map into the cascade.

**Acceptance** (verified locally against `pool/ethereum/0x85b2b559…361d`):
- Cron run: 7 pages → 6873 rows fetched → 6870 unique in DB, 15.5s wall time, 0 skipped.
- Per-category breakdown: `mev_bot 6569, aggregator 275, bridge 14, intent 10, market_maker 2` (Dune's dataset is mostly arbitrage bots — that's the actual underlying distribution, not a classifier bug).
- Per-chain breakdown: `MAINNET 2712, POLYGON 1713, ARBITRUM 814, BASE 618, OPTIMISM 429, AVALANCHE 347, GNOSIS 217, ZKEVM 20`.
- On the GHO pool, coverage 65% → 68%, and for the first time the Sankey shows **CowSwap intents $2.38M**, **0x $2.89M**, **Kyber $1.99M**, **Odos $0.81M**, **1inch $0.35M**, **LI.FI / Binance / FluidVault** — all aggregator/intent flow that was previously zero.

**Operational notes**:
- The Dune query has a Dune-side cached execution with ~3-month TTL. Weekly cron tics hit the cache and burn no Dune credits unless the snapshot expires (in which case Dune transparently re-executes, ~5 min extra on one tick).
- The cron is idempotent — re-running against the same Dune snapshot rewrites the same rows.
- Manual trigger for ad-hoc syncs: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" "$BASE/api/cron/sync-dune-labels"`.

---

## Empirical findings that shaped this design

(From probe runs in `scripts/probe-swap-sources.mjs` and live route hits during development.)

1. **`sender` is `tx.from`, not the Vault caller** — *the* pivotal discovery (Phase 6.4). api-v3's `sender` field surfaces the tx originator EOA. That's why labeling by sender alone never caught aggregator flow: the EOAs are unique-per-user. The actual aggregator/router lives in `tx.to`, which needs a separate dRPC roundtrip to fetch.

2. **`sender == userAddress` on every swap** — both fields return the same EOA. They're either aliased server-side or both resolve to the same underlying on-chain value. No second signal hidden in `userAddress`.

3. **Static-dict sender lookup tops out around 12–15% coverage** on a top-volume stable triangle. Two single addresses (`0x654fae4…`, `0xae2fc48…`, both MEV bots) account for 52% of GHO volume — manual classification of the top offenders lifts that to ~64%.

4. **Hot pools cap below 30d.** At `HARD_CAP = 10000`, the GHO pool's 30d window covers ~16 actual days. The subtitle surfaces this with `· last Nd (cap reached)`. Lifting to 30000 would cover full 30d but at 3× the cold-fetch latency.

5. **The Sankey shape is dominated by source mix, not absolute values.** Toggling 7d ↔ 30d on a saturated pool can look visually identical even though USD volumes differ by 3× — because the source proportions are stable. Visible variance comes from 24h, where MEV vs. retail/aggregator ratios genuinely shift.

6. **The Dune list is 95% MEV bots.** Of 6873 rows, 6569 are labeled "Arbitrage Bot" (one repeated name across many addresses). The remaining ~300 are the protocol/router/bridge dictionary we actually wanted. Both are useful — MEV labels reduce the Unknown bucket on busy pools, aggregator labels surface routing on retail-flow pools.

7. **Etherscan's `getcontractcreation` doesn't cover unverified MEV contracts.** Of 159 addresses we queried during the deployer-enrichment era, 0 returned a deployer. The endpoint returns "No data found" for both EOAs and unverified contracts — the very things MEV operators deploy. Drove the Phase 6.4 pivot to `tx.to` enrichment.

8. **96% of swaps on the GHO/USDT/USDC pool are pure arbitrage.** No amount of label-cascade tuning will surface aggregators that aren't there. On retail-friendly pools, the same pipeline produces a more diverse Sankey.

---

## Open questions / future work

- **CowAmm enhanced view.** Currently we skip the card on CowAmm pools because all flow is trivially CowSwap. A "surplus / directional bias" view (using `GqlPoolSwapEventCowAmm.surplus`) would be a natural follow-up.
- **Deployer-family rules.** Currently removed. A redesign targeting `tx.to` contracts (rather than the EOA `sender` field, which has no deployer) plus a non-Etherscan data source for unverified-contract deployers would catch CREATE2-vanity bot fleets like the bee-prefix family on GHO. Would need a fresh table + helper + cascade tier.
- **Click-through to PoolEventLog.** Selecting a Sankey node could filter the event log to its contributing txs. Out of scope for v1.
- **Min-USD slider in UI.** The builder accepts the option; only the control is missing.
- **Multi-chain rollout.** All static `direct.ts` curation is mainnet + a small Monad seed. Dune already covers 8 chains. As we add per-chain manual entries (e.g. Arbitrum / Base aggregators), they'll layer on top of Dune.
- **Vitest in `apps/balancer-analytics`.** Unit tests for `buildSankeyGraph` (split / rollup / category-share logic) and `labelSwapSource` (cascade order) would prevent regressions. Adding the test runner is a separate scope decision.
- **Propose api-v3 add a `sourceLabel: String` field.** Long-term ideal — backend owns the classification, frontend just consumes. Cross-team work.

---

## Reference

- Probe: `apps/balancer-analytics/scripts/probe-swap-sources.mjs`
- Sample pools used for design + verification:
  - `0x85b2b559bc2d21104c4defdd6efca8a20343361d` — Balancer Aave GHO/USDT/USDC (MEV-heavy stable triangle, ~$11M/24h)
  - `0x6b31a94029fd7840d780191b6d63fa0d269bd883` — Balancer Surge Fluid wstETH-wETH (LST peg, also MEV-heavy)
  - `0x111ce2a60c30f6058a57d0dbae1a39a42d998826` — MainStreet msUSD-USDC (MM-heavy, long-tail unknowns)
  - `0x1ea5870f7c037930ce1d5d8d9317c670e89e13e3` — Balancer rETH - Aave WETH (used to spot the `0xa0b1…7c61` MEV bot)
  - `0xf08d4dea369c456d26a3168ff0024b904f2d8b91` — BCoW 50WETH-50USDC (CowAmm — confirms skip-render path)
- Etherscan v2: <https://docs.etherscan.io/etherscan-v2/getting-started/v2-quickstart>
- Dune query: <https://dune.com/queries/3004790>
- Dune API: <https://docs.dune.com/api-reference/overview>

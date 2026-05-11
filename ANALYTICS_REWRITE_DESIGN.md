# Balancer Analytics — Rewrite as a Third App in `frontend-monorepo`

A working design doc for sunsetting this CRA dashboard and rebuilding it as a third app inside [balancer/frontend-monorepo](https://github.com/balancer/frontend-monorepo) alongside `frontend-v3` (Balancer) and `beets-frontend-v3`. Dated 2026-05-07. Self-contained — meant to be lifted out of this repo and used to bootstrap the PR.

---

## 1. TL;DR

**Sunset this repo. Add `apps/balancer-analytics-v2` to `frontend-monorepo`.**

The monorepo already gives us, for free:
- Apollo Client + codegen against `api-v3.balancer.fi` (Phase 1's primary data source)
- Generated TypeScript types for every api-v3 query already in use by the official frontend (`packages/lib/shared/services/api/generated/`)
- Chakra UI theme tokens (matches main app design language)
- Chain registry (`packages/lib/modules/chains/`)
- viem + wagmi + RainbowKit setup, Sentry, Vercel Speed Insights, ECharts
- Domain modules: `pool`, `tokens`, `vebal`, `protocol`, `staking`, `portfolio`, `featured-pools`, `swap`, `web3`, `user`, `price-impact`, etc. — each with hooks, components, types
- Turborepo pipeline (lint, typecheck, codegen, tests)

That collapses Phase 0 of the previous plan from "stand up Next + GraphQL + theme + chain config + wagmi" to "add a folder, register a project ID." The analytics app is then a thin shell of routes, charts, and a small number of components specific to operational/governance views — not a full rewrite.

**Cuts unchanged:** `Financials` and `ProtocolFees` go (revenue → Dune dashboard, separate effort). **No custom DB/indexer in v1** — same reasoning as before.

**The big shift from the previous draft:** stack choices are no longer ours. We follow monorepo conventions: **Chakra (not Tailwind), Apollo (not urql), Next 16 / React 19, pnpm/turbo workspaces, project-aware config via `NEXT_PUBLIC_PROJECT_ID`**.

---

## 2. Why this dashboard's architecture is a dead end

| Constraint | Today | Implication |
|---|---|---|
| v2 schema | Studio / decentralized gateway with `BalancerSnapshot`, `PoolSnapshot`, `TokenSnapshot`, `LatestPrice`, `TokenPrice`, `User`, `TradePair` | All gone in ormilabs `-smol`. Studio endpoint will eventually be retired; decentralized gateway data is corrupted post-Nov 5, 2025 hack. |
| v3 schema | Not consumed in this repo | We've been bolting v3 onto v2-shaped pages. Data shape mismatch leaks into UI. |
| Multi-chain | Hard-coded chain list in `constants/networks.ts`, separate Apollo client per chain, per-chain hooks aggregated client-side | Adding HyperEVM / Monad / Plasma / Optimism / Sepolia means new logo, new client, new switch case in 6+ files (we just lived this with zkEVM / Fraxtal removal). Monorepo's `modules/chains` already handles this. |
| Build tool | CRA + craco (effectively unmaintained) | TS errors are baseline noise, build is slow, no ISR/edge caching. |
| Codegen | `@graphql-codegen` against multiple schemas, hand-stitched types | Monorepo's `packages/lib/shared/services/api/codegen.ts` already targets api-v3; we only add subgraph schemas we actually need. |
| Routing | React Router v6, network prefix hardcoded into every route | Per-chain SSR / static paths in Next 16 app router would handle this for free. |
| Design system | MUI + custom theme | Diverges from the main Balancer app's Chakra theme — analytics looks like a different product. |

The cost of patching all of this is at least 70% of the cost of starting clean. Joining the monorepo means most of "starting clean" is already done by someone else.

---

## 3. Data inventory — what each source actually offers

### 3.1 ormilabs v2 `-smol` (live pool/swap state per chain)
Schema (live-probed): `balancer/balancers`, `pool/pools`, `poolToken(s)`, `poolShare(s)`, `priceRateProvider(s)`, `swap(s)`, `joinExit(s)`, `token(s)`, `protocolIdData(s)`, `fxoracle(s)`, `ampUpdate(s)`, `_meta`.

**Useful for:** current pool composition, weights, rate providers, last N swaps, last N joins/exits, per-token registry. **Not useful for:** any historical chart (no snapshots), TVL-over-time, fee-over-time, user-level analytics, price history.

### 3.2 ormilabs v3 vault `-smol` (per-chain)
Available chains: Ethereum, Arbitrum, Optimism, Base, Avalanche, Gnosis, Sepolia, **HyperEVM**, **Monad**, **Plasma**.

Schema: `vault(s)`, `pool(s)`, `hook(s)`, `hookConfig(s)`, `liquidityManagement(s)`, `poolToken(s)`, `token(s)`, `rateProvider(s)`, `buffer(s)`, `bufferShare(s)`, `swap(s)`, `addRemove(s)`, `poolShare(s)`, `_meta`.

`Pool` exposes: `protocolSwapFee`, `protocolYieldFee`, `poolCreatorSwapFee`, `poolCreatorYieldFee`, `swapsCount`, `holdersCount`, `swapFee`, `totalShares`, `isPaused`, `isInRecoveryMode`, `pauseManager`, `swapFeeManager`, `poolCreator`, plus `tokens` and `rateProviders` arrays. **Same gap as v2:** no snapshots.

### 3.3 ormilabs v3 pools `-smol` (per-chain, factory/config metadata)
`factory/factories`, plus per-pool-type parameter views: `weightedParams`, `stableParams`, `gyro2Params`, `gyroEParams`, `stableSurgeParams`, `quantAMMWeightedParams` + `quantAMMWeightedDetails`, `lbpparams`, `fixedLBPParams`, `reClammParams`. Each as singular + `_collection`.

**Useful for:** rendering pool-type-specific UIs (weights, amplification, ECLP params, etc.). Marginal — most of this is already exposed via api-v3 + monorepo's `modules/eclp`, `modules/reclamm`, `modules/lbp`.

### 3.4 api-v3.balancer.fi (the workhorse — already typed in the monorepo)
The monorepo's `packages/lib/shared/services/api/` ships generated types and Apollo hooks for, among others:
- `protocolMetricsAggregated` / `protocolMetricsChain` — from `protocol-stats.graphql`
- `poolGetPool` / `poolGetPools` / `poolGetSnapshots` / `poolEvents` — from `pool.graphql` / `pools.graphql`
- `tokenGetCurrentPrices` / `tokenGetHistoricalPrices` / `tokenGetRelativePriceChartData` — from `pool-tokens.graphql`
- `veBalGetTotalSupply` / `veBalGetUser` / `veBalGetUserBalances` / `veBalGetVotingList` — from `vebal.graphql`
- `sorGetSwapPaths`, `poolGetFeaturedPools`, hooks, LBP, etc.

Pool snapshot fields confirmed live: `timestamp`, `totalLiquidity`, `volume24h`, `fees24h`, `surplus24h`, `swapsCount`, `totalShares`, `sharePrice`, `amounts[]`, `chain`. That's enough to drive every historical chart we have today.

**This is the workhorse for the new app, and we don't write a single new client for it — we import from `@repo/lib`.**

**Coverage:**
- ✅ TVL / volume / fees per chain and globally
- ✅ Pool-level historicals (snapshots)
- ✅ Token prices (current + history + relative pairs)
- ✅ veBAL / voting list + per-user balances
- ✅ Multi-chain native (you pass `chainIn`, you don't run N clients)
- ❌ Address-level "all positions" / portfolio scan (DeBank still needed; monorepo's `modules/portfolio` works only for connected user, not arbitrary addresses)
- ❌ Gauge vote breakdowns at the level our `IncentivesTable` does — partial via `veBalGetVotingList`, but vote-incentive efficiency math still requires gauges subgraph + Hidden Hand
- ❌ Custom revenue/fee accounting per the new model — Dune is the right home for that

### 3.5 Gauges subgraph (ormilabs)
Schema: `gauge(s)`, `liquidityGauge(s)`, `rootGauge(s)`, `singleRecipientGauge(s)`, `gaugeFactory`, `gaugeShare(s)`, `gaugeType(s)`, `gaugeVote(s)`, `votingEscrow(s)`, `votingEscrowLock(s)`, `omniVotingEscrowLock(s)`, `lockSnapshot(s)`, `rewardToken(s)`, `gaugeInjector(s)`, `user(s)`, `_meta`.

**This is the full schema, not stripped.** It's what powers Emissions, VotingIncentives, IncentiveSimulator today and continues to work. We add this as a new schema in monorepo codegen — it's analytics-specific and probably doesn't belong in `@repo/lib` unless main app starts surfacing gauge data.

### 3.6 DeBank / Firebase / Maxis static
- DeBank: treasury balances, portfolio composition, transaction history. No replacement on api-v3.
- Firebase: historical address transactions cached (Reports/Treasury).
- Maxis static: pool fee config, SP roster, etc. — JSON files in a sibling repo. Stable.

These all live inside the new analytics app, not in `@repo/lib` (per AGENTS.md: don't put analytics-specific code in shared lib).

---

## 4. Page-by-page disposition

| Page | Today's deps | New app plan |
|---|---|---|
| `Protocol` (global) | v2 subgraph snapshots × N chains, aggregated client-side | **api-v3** `protocolMetricsAggregated` via `@repo/lib`. One query, no chain fan-out. |
| `Chain` (per-chain) | Same | `protocolMetricsChain(chainIn: [X])` via `@repo/lib`. |
| `PoolsOverview` | v2 subgraph + v3 API | api-v3 `poolGetPools` via `@repo/lib`. Reuse `modules/pool` for pool cards. |
| `PoolPage` | v2 snapshots + tx history + v3 API | api-v3 `poolGetPool` + `poolGetSnapshots` + `poolEvents` via `@repo/lib`. Reuse pool-type subviews from `modules/eclp`, `modules/reclamm`, `modules/lbp`. |
| `Tokens` | v2 token list + prices | api-v3 `tokenGetTokens` + `tokenGetCurrentPrices` via `@repo/lib`. |
| `TokenPage` | v2 `TokenSnapshot` + price | api-v3 `tokenGetHistoricalPrices` + price-chart query via `@repo/lib`. |
| `Fees` | v2 `PoolSnapshot` deltas + maxis | api-v3 `poolGetSnapshots`. Drop client-side delta math. |
| `ProtocolFees` | v2 fee snapshots + maxis | **Cut.** Dune dashboard owns revenue. Surface a link instead. |
| `Reports` | DeBank + Firebase + v3 prices | Port as-is. The new fee model makes DAO-revenue reports more relevant, not less. |
| `Treasury` | DeBank | Port as-is. |
| `ServiceProviders` | Firebase + DeBank + helpers | Port as-is. With 100% revenue → DAO, SP spend transparency is a primary view. |
| `Financials` | DeBank tx history + v3 prices | **Cut or fold into Reports.** "P&L" framing belongs in Dune. |
| `Emissions` | gauges subgraph | Port. Add gauges schema to monorepo codegen (or to a per-app codegen step). |
| `VotingIncentives` | gauges subgraph + Hidden Hand | Port as-is. |
| `IncentiveSimulator` | gauges subgraph | Port as-is. |

**Net:** -2 pages (`Financials`, `ProtocolFees`). Most of the deletion is exactly the surface area broken by the v2 schema change. Most of what remains either (a) reuses `@repo/lib` modules or (b) is DeBank/Firebase-bound and ports cleanly.

---

## 5. Architecture inside `frontend-monorepo`

### 5.1 Stack — inherited, not chosen
Per [`AGENTS.md`](https://github.com/balancer/frontend-monorepo/blob/main/AGENTS.md) and [`apps/frontend-v3/package.json`](https://github.com/balancer/frontend-monorepo/blob/main/apps/frontend-v3/package.json):

- **Next.js 16** (App Router), **React 19**, **TypeScript 5.9**, ESM
- **Chakra UI** v2 (`@chakra-ui/react@2.10.x`) — generate theme typings via `chakra-cli tokens` postinstall
- **Apollo Client** v4 (catalogued at `4.1.9`) for GraphQL, **TanStack Query** (`@tanstack/react-query`) for non-GraphQL async state
- **viem** + **wagmi** + RainbowKit (read-only flow possible — most analytics pages don't need wallet connect)
- **ECharts 6** + **echarts-for-react** — same as today, port chart configs directly
- **GraphQL codegen** via Turbo `pnpm --filter @repo/lib graphql:gen`; runs in dev with `--watch`, runs once before `next build`
- **Sentry** Next.js integration, **Vercel Speed Insights**, `nextjs-toploader`
- **`nuqs`** for URL state (replaces our React Router query-string juggling)
- **Vitest** for unit + integration tests; Playwright e2e in `packages/e2e-tests`
- **`@repo/lib`**, **`@repo/test`**, **`@repo/eslint-config`**, **`@repo/prettier-config`**, **`@repo/typescript-config`** as workspace deps

**No Tailwind, no shadcn, no urql** — the previous draft's stack proposal is overridden by monorepo conventions.

### 5.2 New app layout
```
apps/balancer-analytics-v2/                    # new
  app/
    layout.tsx
    page.tsx                                   # Protocol overview
    [chain]/
      page.tsx                                 # Per-chain overview
      pools/page.tsx                           # PoolsOverview
      pools/[id]/page.tsx                      # PoolPage
      tokens/page.tsx                          # Tokens
      tokens/[address]/page.tsx                # TokenPage
    governance/
      emissions/page.tsx
      voting-incentives/page.tsx
      simulator/page.tsx
    treasury/
      page.tsx
      service-providers/page.tsx
      reports/page.tsx
  lib/
    config/
      project.ts                               # NEXT_PUBLIC_PROJECT_ID = "analytics" entry
    modules/
      gauges/                                  # gauges subgraph queries + hooks (analytics-only)
      treasury/                                # DeBank wrappers (analytics-only)
      service-providers/                       # firebase + maxis-static glue
      reports/
    components/
      charts/                                  # ECharts configs (port from current repo)
      tables/
  graphql/
    gauges.graphql                             # gauges subgraph operations
    v2-smol.graphql                            # v2 smol live state
    v3-vault-smol.graphql                      # v3 vault smol live state
    v3-pools-smol.graphql                      # v3 pools smol metadata
  codegen.ts                                   # app-local codegen (subgraph schemas only)
  next.config.ts
  package.json
  tsconfig.json
  eslint.config.js
  README.md
```

### 5.3 What we add to `@repo/lib` vs. keep app-local

Per AGENTS.md: *"Both apps share `packages/lib`; the active project is resolved from `NEXT_PUBLIC_PROJECT_ID`. Hardcoding breaks the other app silently."*

**To `@repo/lib` (only if cross-app value):**
- New chain entries (HyperEVM, Monad, Plasma, etc.) if main app doesn't already have them. Goes in `modules/chains/`.
- A `protocol-snapshots.graphql` extension if existing `protocol-stats.graphql` doesn't cover the historical fields we want.

**App-local (`apps/balancer-analytics-v2/lib/`):**
- Gauges subgraph client + queries — analytics consumes these heavily, main app doesn't.
- Smol subgraph clients — analytics-only fallback for live state where api-v3 doesn't reach.
- Treasury / DeBank module — analytics-specific.
- Service Providers module — analytics-specific.
- Maxis-static fee config glue — analytics-specific.
- All routes and page components.

### 5.4 Project ID strategy

Two viable approaches:

**(a) Add `NEXT_PUBLIC_PROJECT_ID = "analytics"`** to `@repo/lib/config/`:
- Pros: clean separation, `isAnalytics` guard for any analytics-specific lib code we add.
- Cons: requires adding `projects/analytics.ts` and a third `PROJECT_CONFIG` row in the type definitions. Subtle: if analytics inherits Balancer chain set, `isBalancer` checks throughout lib must also include `isAnalytics` or be reformulated. Touchy across many files.

**(b) Reuse `NEXT_PUBLIC_PROJECT_ID = "balancer"`** in the analytics app:
- Pros: zero changes to `@repo/lib` config layer, analytics inherits all `isBalancer` gating naturally.
- Cons: any feature flag we want analytics-on / main-off (or vice versa) needs a different mechanism (per-app env var, route-level check).

**Recommendation: (b) for v1.** The analytics app is a Balancer surface — it should see what Balancer sees. Add per-app env vars (`NEXT_PUBLIC_ANALYTICS_FEATURE_X=true`) when we genuinely need feature divergence. Revisit (a) only if it becomes painful.

### 5.5 Multi-chain handling

- Use `@repo/lib/modules/chains` as the source of truth. Don't duplicate chain configs.
- api-v3 takes `chainIn: [GqlChain!]`. Single query, no fan-out.
- For ormilabs subgraphs (gauges + smol), keep one Apollo client with a function that swaps `uri` per chain — or one client per subgraph type with chain as a query variable where the schema permits. Avoid the current 10-clients-per-chain-per-schema model.
- Routing: `/[chain]/...` segments. Static params built from `modules/chains`. Defaults to `ethereum`.

### 5.6 Codegen

Monorepo runs `pnpm --filter @repo/lib graphql:gen` in dev (watched) and pre-build. We have two options:

1. **Add subgraph schemas to `@repo/lib/shared/services/api/codegen.ts`** — generated types land in `packages/lib/shared/services/api/generated/`, importable from any app. **Don't do this** unless main app also wants them; AGENTS.md explicitly warns against contaminating shared lib with project-specific code.
2. **Local codegen in `apps/balancer-analytics-v2/codegen.ts`** for subgraph schemas only, generating into `apps/balancer-analytics-v2/lib/generated/`. Add it to the app's `dev`/`build` scripts so it runs alongside Next.

**Pick (2)**: keeps shared lib clean, keeps subgraph types co-located with the app that uses them.

### 5.7 Auth / rate limits

- api-v3 is public; relies on Apollo cache + Next caching.
- DeBank API key — server-side only via Next route handlers (`app/api/debank/*`), never bundled. Today's CRA app risks bundling it; the new app won't.
- Firebase: read-only public collections.

---

## 6. Do we need a custom DB / indexer?

**Default: no.** Reasons unchanged from previous draft:

1. api-v3 already indexes the snapshots we need across chains.
2. Smol subgraphs cover live state.
3. Gauges subgraph is intact.
4. DeBank covers treasury wallets.
5. Dune is the home for revenue/fee accounting.

**Escalation path** (only if a feature can't be served by the above):
- **Tier 1: scheduled JSON materialization** — GitHub Actions cron writes aggregated JSON to Vercel Blob / R2. Next reads static JSON. Cheap.
- **Tier 2: Postgres + worker** — only if Tier 1 query latency or row counts hurt. Trigger: aggregate >100k rows or query >2s after caching.

Don't build a DB on day one.

---

## 7. Up- and down-sides of the monorepo approach

**Pros**
- Phase 0 collapses: scaffolding, theme, GraphQL plumbing, chain registry, wagmi all inherited.
- Snapshot data layer is identical to what BalancerLabs frontend uses — we benefit from their bug fixes and schema evolution automatically.
- Visual consistency with main app via shared Chakra theme. Analytics no longer looks like a different product.
- Single deploy pipeline, single CI, single lint config.
- Adding a chain is a single PR to `modules/chains` and ripples to analytics for free.
- Discoverability: PR review by people who already know the codebase.

**Cons**
- We're tied to monorepo's stack: Next 16 / React 19 / Chakra 2 / Apollo 4. Stack upgrades happen on their schedule, not ours.
- Repo permissions: we need write access (or fork + PR cadence). Slower iteration vs. owning a separate repo.
- CI minutes: turbo cache helps, but a full `turbo build` across 3 apps is meaningfully longer than a standalone Next app. Mitigation: cache + filter `--filter=balancer-analytics-v2`.
- AGENTS.md conventions limit where we can put project-specific code. We need to internalize the `@repo/lib` boundary or get pushback in review.
- We give up MUI ecosystem (DataGrid, DatePickers in current dashboard). Chakra equivalents exist (Chakra Table + react-table for grids; `react-day-picker` / `react-aria` for date inputs) but we'll port a chunk of UI manually.
- Our analytics-specific subgraph queries (gauges, smol fallbacks) live outside `@repo/lib`, so they don't benefit from the centralized Apollo client provider. We'll instantiate a small per-app Apollo client. That's fine, just worth being explicit about.
- Sentry / Speed Insights are configured per-app — we add them in our app's config, not free.

**Risks**
- api-v3 deprecates a query main app stops using but analytics relies on. Monorepo's GraphQL operations are co-located with the main app's needs; analytics-only operations should be added to the same `.graphql` files (since codegen runs there) but reviewed with awareness that they're analytics-driven.
- Snapshot data quality post-Nov 5 hack period — same risk regardless of architecture. Add a "data quality" badge for affected ranges; spot-check `poolGetSnapshots` against Dune.
- New chain support lag: smol subgraphs include HyperEVM/Monad/Plasma; api-v3 may not have these chains active for analytics endpoints yet. Mitigation: progressive enhancement — analytics shows api-v3 chains first, smol-only chains via fallback path.
- Maintainer bandwidth: third app means a third surface to keep green during upgrades. We need to commit to keeping it from rotting.

---

## 8. Proposed phasing

| Phase | Scope | Done means |
|---|---|---|
| 0 | Bootstrap | New `apps/balancer-analytics-v2` skeleton merged: `package.json` (workspace deps on `@repo/lib`, `@repo/test`, configs), Next 16 app router scaffold, app-local `codegen.ts` for subgraph schemas, deploy preview to Vercel under `analytics-v2.balancer.fi` (or similar). |
| 1 | Core analytics | Protocol overview, per-chain page, PoolsOverview, PoolPage, Tokens, TokenPage. All on api-v3 via `@repo/lib`. Smol subgraphs wired only where api-v3 has gaps. |
| 2 | Governance | Emissions, VotingIncentives, IncentiveSimulator (port from current). Gauges subgraph codegen wired in. |
| 3 | Treasury / SPs | Treasury, ServiceProviders, Reports (DeBank + Firebase port). DeBank API key behind Next route handlers. |
| 4 | Polish | Per-chain SEO, sharing cards, Chakra dark mode parity with main app, audit bundle sizes, kill any lingering MUI/Apollo-side imports from this CRA repo. Add data-quality banner for hack-impacted ranges. |
| 5 | Cutover | Banner on the old app pointing to new domain. Decommission this repo. Archive. |

Phase 0 is much smaller now. Phase 1 is the real work.

---

## 9. Open questions for the team

1. **Repo permissions.** Do we have (or can we get) write access to `balancer/frontend-monorepo` for the analytics app? Or is the model fork → PR? Affects iteration speed.
2. **Project ID.** Approve approach (b) — analytics reuses `PROJECT_ID=balancer` and gates analytics-specific features via per-app env vars? Or do we want a third `analytics` project ID?
3. **Domain / deploy target.** Subdomain (`analytics.balancer.fi`)? Path on existing domain? Affects Sentry config, Vercel project setup, redirect strategy from old dashboard.
4. **Wallet connect.** Drop wagmi/RainbowKit from analytics? Most pages are read-only and don't need it. Saves bundle. Or keep for future "view-as-you" features?
5. **Archival v2 historical data.** Snapshot to S3 once before old subgraphs disappear entirely? Cheap insurance.
6. **Cut scope.** Confirm: `Financials` cut, `ProtocolFees` cut (Dune), `IncentiveSimulator` *kept* (gauges schema works). All three of these should be locked before Phase 1 starts.
7. **DAO revenue tile.** New fee model puts 100% to DAO — do we surface a lightweight tile that embeds Dune (iframe or screenshot+link), or omit and rely on the link in `Reports`?
8. **Stack divergence we'd otherwise want.** Anything we would have chosen differently in a standalone repo (Tailwind, urql, SWR) that hurts enough to make us reconsider monorepo? Honest answer should be no.

---

## 10. Decision asked

Approve the rewrite as `apps/balancer-analytics-v2` in `frontend-monorepo`, with:
- `Financials` cut, `ProtocolFees` cut (link to Dune)
- No custom indexer in v1
- Project ID = `balancer` (option 5.4(b))
- App-local codegen for subgraph schemas (option 5.6 (2))

If yes, Phase 0 is a single PR to `frontend-monorepo` adding the new app skeleton + Vercel project.

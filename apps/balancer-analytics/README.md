# Balancer Analytics

Standalone analytics surface aggregating Balancer v2 and v3 data, hosted as a third app inside `frontend-monorepo` alongside `frontend-v3` and `beets-frontend-v3`.

See `ANALYTICS_REWRITE_DESIGN.md` at the monorepo root for the full design rationale.

## Phase 0 status

Skeleton + Protocol overview page wired against `protocolMetricsAggregated` via `@repo/lib`.

- `NEXT_PUBLIC_PROJECT_ID=analytics` resolves to `ProjectConfigAnalytics` (mirrors Balancer chain set, identity-only overrides).
- Read-only: no wagmi / RainbowKit providers in the tree.
- Chakra theme is a local copy of the bal theme (`lib/services/chakra/themes/analytics/`).

## Getting started

From the monorepo root:

```bash
cp apps/balancer-analytics/.env.template apps/balancer-analytics/.env.local
cp apps/balancer-analytics/.env.local packages/lib/.env.local   # codegen reads from here
pnpm install
pnpm dev:analytics
```

App runs at <http://localhost:3002>.

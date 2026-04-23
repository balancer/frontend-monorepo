# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Rules

### Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `apps/frontend-v3/node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

### Never hardcode project-specific values in `packages/lib`

Both apps share `packages/lib`; the active project is resolved from `NEXT_PUBLIC_PROJECT_ID` in `config/getProjectConfig.ts`, which exposes `PROJECT_CONFIG` and `isBalancer` / `isBeets`. Hardcoding breaks the other app silently.

- Use `PROJECT_CONFIG.projectName`, `projectUrl`, `projectLogo` instead of literal `"Balancer"` / `"Beets"` / domain strings.
- Gate project-only features (maBEETS, relics, etc.) with `isBalancer` / `isBeets`.
- New config fields go in `config.types.ts` and must be populated in **both** `projects/balancer.ts` and `projects/beets.ts`.

## Architecture

pnpm workspaces + Turborepo. Both `apps/frontend-v3` (Balancer) and `apps/beets-frontend-v3` (Beets) are thin Next.js App Router shells — almost all business logic lives in `packages/lib` (`@repo/lib`). Prefer adding new code to `packages/lib` unless it is genuinely app-specific.

### Key patterns

- **Blockchain interaction**: viem + wagmi + RainbowKit. Pool actions (add/remove liquidity, swaps) go through handler patterns in `modules/pool/actions/`.
- **Data fetching**: Apollo Client for GraphQL (Balancer API), react-query for other async state. GraphQL codegen runs concurrently with `next dev` (via `graphql:gen --watch`) and runs once before `next build`; generated types land in `packages/lib/shared/services/api/generated/` — don't run `graphql:gen` manually unless regenerating outside a dev/build cycle.
- **Multi-chain**: Chain-specific config in `modules/chains/`.
- **URL state**: `nuqs` for query-string-based state management.
- **Pool types**: Weighted, Stable, CowAmm, LBP, reCLAMM, ECLP — each with specific UI and action handlers.

## Testing

Vitest across all packages. Integration tests live in `packages/lib` and use a separate config.

Run a single integration test file:

```bash
pnpm --filter @repo/lib exec vitest run -c ./vitest.config.integration.ts <path-relative-to-packages/lib>
```

For unit tests, omit the `-c` flag (uses default `vitest.config.ts`).

**Don't use `pnpm test:integration -- <pattern>`** — the argument doesn't reliably filter to a single file. Use the `pnpm --filter` form above.

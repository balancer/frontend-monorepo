# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Rules

### Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

### Never hardcode project-specific values in `packages/lib`

Both apps share `packages/lib`; the active project is resolved from `NEXT_PUBLIC_PROJECT_ID` in `config/getProjectConfig.ts`, which exposes `PROJECT_CONFIG` and `isBalancer` / `isBeets`. Hardcoding breaks the other app silently.

- Use `PROJECT_CONFIG.projectName`, `projectUrl`, `projectLogo` instead of literal `"Balancer"` / `"Beets"` / domain strings.
- Gate project-only features (veBAL, LBP, maBEETS, etc.) with `isBalancer` / `isBeets`.
- New config fields go in `config.types.ts` and must be populated in **both** `projects/balancer.ts` and `projects/beets.ts`.lines

## Architecture

**Monorepo** using pnpm workspaces + Turborepo.

### Apps (Next.js with Turbopack, React, Chakra UI)

- `apps/frontend-v3` — Balancer app (balancer.fi). Next.js App Router in `app/`.
- `apps/beets-frontend-v3` — Beets app (same stack, different branding/config).

Both apps are thin shells: routing lives in `app/(app)/` (pools, swap, portfolio, create, vebal, lbp) and `app/(marketing)/`. Almost all business logic is in `packages/lib`.

### packages/lib — Shared library (`@repo/lib`)

Most domain logic lives here; prefer adding new code to `packages/lib` unless it is genuinely app-specific. Two top-level directories:

- **`modules/`** — Domain-specific feature modules (pool, swap, tokens, transactions, web3, vebal, staking, lbp, reclamm, eclp, cow, etc.). Each module typically contains components, hooks, helpers, actions, and tests.
- **`shared/`** — Cross-cutting concerns:
  - `shared/services/` — API clients (GraphQL codegen via `graphql:gen`), Chakra theming, viem config, coingecko, fathom analytics, etc.
  - `shared/components/` — Reusable UI components (inputs, buttons, layouts, modals, etc.)
  - `shared/hooks/` — Shared React hooks (currency, breakpoints, debounce, etc.)
  - `shared/utils/` — Pure utility functions

### Other packages

- `packages/e2e-tests` — Playwright E2E tests
- `packages/test` (`@repo/test`) — Shared test utilities (wagmi mock config, render helpers)
- `packages/eslint-config`, `packages/prettier-config`, `packages/typescript-config` — Shared configs

### Key patterns

- **Blockchain interaction**: viem + wagmi + RainbowKit for wallet connection. Pool actions (add/remove liquidity, swaps) go through handler patterns in `modules/pool/actions/`. Each action directory typically follows a consistent shape: `form/`, `handlers/`, `queries/`, `modal/`.
- **Data fetching**: Apollo Client for GraphQL (Balancer API), react-query for other async state. GraphQL codegen runs concurrently with `next dev` (via `graphql:gen --watch`) and runs once before `next build`; generated types land in `packages/lib/shared/services/api/generated/`.
- **Multi-chain**: Chain-specific config in `modules/chains/`. The app supports Ethereum, Arbitrum, Base, Gnosis, Optimism, Avalanche, Sonic, and others.
- **URL state**: `nuqs` for query-string-based state management.
- **Pool types**: Weighted, Stable, CowAmm, LBP, reCLAMM, ECLP — each with specific UI and action handlers.

## Build & Development Commands

```bash
pnpm install                  # install dependencies
pnpm dev:bal                  # dev server for Balancer app (localhost:3000)
pnpm dev:beets                # dev server for Beets app
pnpm dev:bal:fork             # dev server against local anvil fork (needs make fork-ethereum running)
pnpm build                    # build all apps/packages via turbo
pnpm typecheck                # typecheck all packages
pnpm lint                     # eslint (all packages)
pnpm lint:fix                 # eslint autofix
pnpm lint:all                 # eslint + prettier + stylelint
pnpm lint:all:fix             # autofix all linters
pnpm graphql:gen              # regenerate GraphQL types
```

Pre-commit hook runs `lint-staged` (eslint + prettier on staged files).

## Testing

```bash
# Unit tests (vitest, across all packages)
pnpm test:unit
pnpm test:unit:watch

# Integration tests (vitest with separate config)
pnpm test:integration
pnpm test:integration:watch

# Run a single test file from packages/lib:
pnpm --filter @repo/lib exec vitest run -c ./vitest.config.integration.ts <path-relative-to-packages/lib>
# For unit tests, omit the -c flag (uses default vitest.config.ts)

# E2E tests (Playwright) — requires .env.local + local anvil fork
make fork-ethereum              # start local fork
pnpm dev:bal:fork               # start app in fork mode
pnpm test:e2e:dev:ui:bal        # launch Playwright UI
```

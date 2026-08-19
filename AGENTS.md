# AGENTS.md

This file provides guidance to coding agents working in this repository.

## Rules

### Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `apps/frontend-v3/node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

### Always verify lint before committing

Cloud Agent git hooks override `core.hooksPath`, so Husky / `lint-staged` (eslint `--fix`, prettier, typecheck) do **not** run on commit here. Do not assume a green commit means lint passed.

Before every commit:

1. Run eslint on every touched file (e.g. `pnpm --filter @repo/lib exec eslint <path> --max-warnings 0`, or the matching app/package `lint` script). Fix `padding-line-between-statements` and other style errors — do not strip required blank lines around multiline statements.
2. Review the full `git diff --staged` (not just the intended hunk). Odd stats like `1 insertion, 2 deletions` for a one-line edit usually mean an accidental whitespace/padding change.

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
- **Pool types**: Weighted, Stable, CowAmm, LBP, AutoRange, ECLP — each with specific UI and action handlers.

## Pull Requests

When creating a PR, read `.github/pull_request_template.md` and fill in every section. The `<!-- -->` blocks in the template are examples — treat them as guidance for tone and format, but strip them from the final PR body. Do not leave placeholder text, empty sections, or `...` in the body.

Use `gh pr create --title ... --body ...` with a fully populated body. Do not rely on the interactive editor.

### Section guidance

- **What** — Summarize the diff at a high level, one bullet per logical change: `- Added...`, `- Updated...`, `- Refactored...`, `- Moved...`. Do not restate every file; group related changes.
- **Why** — Ground the motivation in something concrete: a requested feature, design feedback, a fast-follow fix, or preparation for a planned change. If the change was requested in an issue/ticket, reference it here.
- **Test Steps** — List concrete manual verification steps a reviewer can follow, one checkbox per step. Include the feature flag to enable (if any), the page/route to visit, and the expected result. If the change has no manual surface, say so explicitly instead of leaving it blank.
- **Risks / Breaking Changes** — Call out anything that could regress: changed token decimals or balances handling, migration requirements, changes behind a feature flag (name the flag), dependency bumps, or anything touching shared `packages/lib` code that also serves the Beets app.
- **Other Notes** — Only if genuinely applicable: known limitations, follow-up work, or things deliberately left out of this change. Omit the section entirely if there is nothing to note.

### Rules

- Verify each claim against the actual diff — do not invent test steps, flags, or risks. If you did not change it, do not describe it.
- If the PR touches `packages/lib`, note in **Risks** whether the change affects the other app (Balancer ↔ Beets) via `NEXT_PUBLIC_PROJECT_ID`.
- Always write test steps you could actually run — no generic filler.

## Testing

Vitest across all packages. Integration tests live in `packages/lib` and use a separate config.

Name Vitest files with `*.spec.*`. Use `*.integration.spec.*` for integration tests. Do not add new `*.test.*` files.

Run a single integration test file:

```bash
pnpm --filter @repo/lib exec vitest run -c ./vitest.config.integration.ts <path-relative-to-packages/lib>
```

For unit tests, omit the `-c` flag (uses default `vitest.config.ts`).

**Don't use `pnpm test:integration -- <pattern>`** — the argument doesn't reliably filter to a single file. Use the `pnpm --filter` form above.

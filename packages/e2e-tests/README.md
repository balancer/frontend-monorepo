# Balancer End to End tests

We use [playwright](https://playwright.dev/) for our end to end (e2e) tests.

## E2E tests in CI

We have two types of E2E tests: smoke tests and functional tests

### Smoke tests

```bash
pnpm run test:e2e:build
```

The safest way to E2E test is doing it against a real build cause they can catch issues that do not
happen in dev but do happen after build. However, until builds are faster, we will keep a very
reduced amount of smoke tests to avoid long CI pipelines increasing the feedback loop.

In every PR we:

- Use `turbo` to run the `build` with the code of that PR
- Run `pnpm start` to serve the generated build
- Wait for the 2 frontend builds being served (`balancer` in `localhost:3000` and `beets` in
  `localhost:3001`)
- Run `playwright` tests for both apps

Check this video for a detailed explanation: https://www.youtube.com/watch?v=bsE1VJn1HeU

### Dev E2E tests

```bash
# This is run by GHA when running this tests in CI
anvil --fork-url https://lb.drpc.live/ethereum/<YOUR_LOCAL_NEXT_PRIVATE_DRPC_KEY> --port 8545
```

```bash
pnpm run test:e2e:dev
```

This tests use an anvil fork so that we can impersonate accounts and run complete transaction flows
(using wagmi connector mock to avoid playwright interacting with a real wallet).

In CI the Balancer dev suite is split across three jobs by `scripts/shard-specs.mjs`, which assigns
whole spec files to each job. Keep that granularity: the specs share fork state within a file
(`liquidity-operations` removes the LP tokens its own earlier tests minted), so Playwright's
test-level `--shard` cuts those groups apart and the later half fails. Add a spec and it is picked
up automatically — no list to rebalance.

CI resolves the fork block for mainnet and sonic once per run (the `Resolve-Fork-Blocks` job in
`.github/workflows/checks.yml`): head minus a reorg-safety depth, floored to a bucket. All shards
then fork at the _same_ block, so runs within a bucket window reuse drpc's warm state cache instead
of re-reading a fresh head every run — while the block stays recent enough to match the test API
indexer. When running anvil locally, either omit `--fork-block-number` or pass a recent block.

## Local E2E tests

### Install playwright locally

```bash
  pnpm playwright:install:chromium
  # or
  pnpm playwright:install # if you want to test with non-chromium browsers locally
```

You can also run `pnpm test:e2e:build` or `pnpm test:e2e:dev` but, when implementing new tests, we
recommend the ui option:

```bash
pnpm run test:e2e:build:ui
# or
# Remember to run the mainnet anvil fork locally before running dev E2E tests for Balancer.
pnpm run test:e2e:dev:ui:bal
```

For more info about playwright tests check the [official documentation](https://playwright.dev/) and
this [youtube video](https://www.youtube.com/watch?v=lcHaBZKuPdk).

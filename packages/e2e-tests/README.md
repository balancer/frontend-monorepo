# Balancer End to End tests

We use [playwright](https://playwright.dev/) for our end to end (e2e) tests.

## E2E tests in CI

We have two types of E2E tests: smoke tests and functional tests

### Smoke tests

```bash
pnpm run test:e2e:build
```

Our app is big and nextjs builds are slow (> 5 minutes) because they use webpack(turbopack is not
yet ready for production builds). The safest way to E2E test is doing it against a real build cause
they can catch issues that do not happen in dev but do happen after build. However, until builds are
faster, we will keep a very reduced amount of smoke tests to avoid long CI pipelines increasing the
feedback loop.

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
anvil --fork-url https://lb.drpc.org/ogrpc?network=ethereum&dkey=YOUR_LOCAL_NEXT_PRIVATE_DRPC_KEY --port 8545
```

```bash
pnpm run test:e2e:dev
```

Running the dev server in turbopack mode is much faster than building the app, so we run functional
E2E tests against a local dev server.

Additionally, this tests use an anvil fork so that we can impersonate accounts and run complete
transaction flows (using wagmi connector mock to avoid playwright interacting with a real wallet).

## Local E2E tests

You can also run `pnpm test:e2e:build` or `pnpm test:e2e:dev` but, when implementing new tests, we
recommend the ui option:

```bash
pnpm run test:e2e:build:ui
# or
# Remember to run the mainnet anvil fork locally before running dev E2E tests.
pnpm run test:e2e:dev:ui
```

For more info about playwright tests check the [official documentation](https://playwright.dev/) and
this [youtube video](https://www.youtube.com/watch?v=lcHaBZKuPdk).

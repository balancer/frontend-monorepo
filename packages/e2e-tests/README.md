# Balancer End to End tests

We use [playwright](https://playwright.dev/) for our end to end (e2e) tests.

## E2E tests in CI

In every PR we:

- Use `turbo` to run the `build` with the code of that PR
- Run `pnpm start` to serve the generated build
- Wait for the 2 frontend builds being served (`balancer` in `localhost:3000` and `beets` in
  `localhost:3001`)
- Run `playwright` tests for both apps

Check this video for a detailed explanation: https://www.youtube.com/watch?v=bsE1VJn1HeU

## Local E2E tests

You can also run `pnpm test:e2e` but, when implementing new tests, we recommend the ui option:

```bash
pnpm run test:e2e:ui
```

For more info about playwright tests check the [official documentation](https://playwright.dev/) and
this [youtube video](https://www.youtube.com/watch?v=lcHaBZKuPdk).

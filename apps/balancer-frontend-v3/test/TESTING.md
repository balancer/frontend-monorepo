# Testing overview

Check [testing conventions](./TESTING_CONVENTIONS.md) if want to understand the reasoning behind our
testing strategy and setup.

## Unit tests

```bash
pnpm test:unit
```

These include pure function tests, react hook tests and component tests.

They use [MSW](https://mswjs.io/) to intercept any network call.

Any module/hook that uses onchain calls should be injected via a context provider and we should mock
its public API.

## Integration (onchain) tests

```bash
pnpm test:integration
```

These are tests over any module/hook that uses onchain calls. vitest finds them by their special
filename **_.integration.spec._**.

We use a separate vitest configuration for these onchain tests that run against an
[anvil](https://book.getfoundry.sh/anvil/) fork.

## E2E tests

TBD.

## Notes

### Next 13 and testing

Next 13 and RSC are very new and testing is not yet mature enough so the testing strategy above
could change when they finally release better testing tools/recommendations.

Related threads:

- [Support for async react server components](https://github.com/testing-library/react-testing-library/issues/1209)
- [Support Next.js 13 (App directory)](https://github.com/mswjs/msw/issues/1644)

### Watchers

- vitests are run in watch mode by default.
- next currently uses a global webpack watcher for HMR.
- It is possible that vitest tests are rerun by next watcher if you have it running in another tab.

### Testing strategy: Component vs Hook tests

There are many different testing strategies and flavours by different authors but this is an
extended one in frontend:

> The more your tests resemble the way your software is used, the more confidence they can give you.

That means that the more we test features by interacting with the component's UI the better.
However, our context is special because we normally have complex logic with many edge cases that
makes it challenging and cumbersome to test from the UI. A general advise would be extracting that
logic to hook/s so that we can have tests that are faster and simpler to code, understand and
maintain. Then leave component tests for the happy paths.

From [react hooks testing library](https://react-hooks-testing-library.com/#the-solution):

> When to test hooks instead of components: You have a complex hook that is difficult to test
> through component interactions 👈 We will have this scenario in many cases

## TODO

- Improve builder/mock/fake namespaces and conventions
  - For now, everything starting with a/some (i.e. **aTokenBase**, **someTokenAmounts** ) is a
    builder that will be used by mocks (from a unit test itself or from MSW handlers).
- Improve react-query dependency handling:
  - wagmi depends on react-query and we use react-query in tests so we need to enforce that both use
    the same version
  - We are using [pnpm.overrides](https://pnpm.io/package_json#pnpmoverrides) option for that but
    maybe there is a better solution
- Improve wagmi account connection to test connection related edge-cases:
  - We are using a global _vi.mock('wagmi')_ for now (see setup.vitest.tsx)
- Add e2e smoke tests using playwright and anvil

### Integration tests

- Extend anvil setup to use other chains than mainnet
- Push anvil cache to use in CI
- Add automatic retries to Test-Integration GHA to avoid false positives due to connectivity
  problems (see )
- Use [createProxy](https://github.com/wagmi-dev/anvil.js/#createproxy) from @viem/anvil to boost
  integration tests by using a different instance by vitest thread.

## Credits

Kudos to [wagmi](https://wagmi.sh/) and [viem](https://viem.sh/) repos where we got most of the
ideas for anvil integration testing.

## Testing conventions

Check [testing conventions](./TESTING_CONVENTIONS.md) if want to understand the reasoning behind our
testing strategy and setup.

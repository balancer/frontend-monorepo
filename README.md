# Balancer frontend monorepo

_This project uses `pnpm`, if you haven't already installed it you can find the documentation here:
https://pnpm.io/installation_

_The monorepo uses [pnpm workspaces](https://pnpm.io/workspaces) along with Turborepo to manage
build orchestration, to learn more about Turborepo please see the
[docs](https://turbo.build/repo/docs)._

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/balancer/frontend-monorepo)

## What's inside?

This monorepo includes the following apps & packages:

### Apps

- [apps/frontend-v3](https://github.com/balancer/frontend-monorepo/tree/main/apps/frontend-v3): The
  official web app for the Balancer protocol, hosted at [https://balancer.fi](https://balancer.fi).
- [apps/beets-frontend-v3](https://github.com/balancer/frontend-monorepo/tree/main/apps/beets-frontend-v3):
  The (still in development) web app for the Beets protocol.

### Packages

- [packages/lib](https://github.com/balancer/frontend-monorepo/tree/main/packages/lib): Shared logic
  for all frontend-v3 apps.
- [packages/eslint-config](https://github.com/balancer/frontend-monorepo/tree/main/packages/eslint-config):
  eslint configurations.
- [packages/typescript-config](https://github.com/balancer/frontend-monorepo/tree/main/packages/typescript-config):
  Typescript config's used throughout the monorepo.

## Getting started

Click on the links below to see the README for each app:

- [frontend-v3](https://github.com/balancer/frontend-monorepo/tree/main/apps/frontend-v3/README.md)
- [beets-frontend-v3](https://github.com/balancer/frontend-monorepo/tree/main/apps/beets-frontend-v3/README.md)

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Testing

To test all apps and packages, run:

```
pnpm test:unit
// or
pnpm test:integration
// or
pnpm test:e2e
```

### Install a package

If you want to install a new npm package in a sub application like `frontend-v3` add the --filter
option to your install command, e.g.:

```
pnpm add some-pkg --filter=frontend-v3
```

This filter should match the `name` attribute in the app or package package.json.

## Turborepo

### Remote Caching

Turborepo can use a technique known as
[Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache
artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with
Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the
following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your
[Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the
root of your Turborepo:

```
npx turbo link
```

### Useful links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

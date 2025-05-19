# Balancer frontend V3

[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/balancer/frontend-monorepo)

## Getting Started

_This project uses `pnpm`, if you haven't already installed it you can find the documentation here:
https://pnpm.io/installation_

To setup the development environment, first clone the repo:

```bash
git clone https://github.com/balancer/frontend-monorepo.git && cd frontend-monorepo/apps/frontend-v3
```

Copy the `.env.template` file to `.env.local`:

```bash
cp .env.template .env.local
```

Copy the `.env.local` file to `../../packages/lib`:

```bash
cp .env.local ../../packages/lib
```

Next, install dependencies:

```bash
cd ../..
pnpm install
```

Then, run the development server:

```bash
pnpm dev:bal
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## dev with turbopack

By default, we use turbo mode for better DX with faster compile times and faster HMR:

```bash
pnpm dev
```

### Sentry does not work with turbopack yet

This is not a real issue as we don't normally use sentry in dev mode. The only downside is that you
will see a sentry warning in the console when using turbopack mode.

For build mode, we will always use webpack which works with Sentry as expected.

Check
[this link](https://github.com/getsentry/sentry-javascript/issues/8105#issuecomment-2577559235) for
more context.

You can explicitly run with webpack mode with:

```bash
pnpm dev:webpack
```

## Testing

See [TESTING.md](./test/TESTING.md).

## Developing in Windows

To develop in Windows you need to use WSL2. Learn more about it
[here](https://learn.microsoft.com/en-us/windows/wsl/about).

With WSL2 all environment variables will be correctly set without having to use `cross-env`.

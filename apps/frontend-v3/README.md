# Balancer frontend V3

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

## Testing

See [TESTING.md](./test/TESTING.md).

## Developing in Windows

To develop in Windows you need to use WSL2. Learn more about it
[here](https://learn.microsoft.com/en-us/windows/wsl/about).

With WSL2 all environment variables will be correctly set without having to use `cross-env`.

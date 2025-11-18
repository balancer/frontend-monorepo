# Beets frontend V3

## Getting Started

_This project uses `pnpm`, if you haven't already installed it you can find the documentation here:
https://pnpm.io/installation_

To setup the development environment, first clone the repo:

```bash
git clone https://github.com/balancer/frontend-monorepo.git && cd frontend-monorepo/apps/beets-frontend-v3
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

Generate GraphQL types

```bash
pnpm run graphql:gen
```

Then, run the development server:

```bash
pnpm dev:beets
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

## dev with turbopack

By default, we use turbo mode for better DX with faster compile times and faster HMR:

```bash
pnpm dev:beets
```

## Testing

See [Testing instructions](../../README.md#testing).

## Developing in Windows

To develop in Windows you need to use WSL2. Learn more about it
[here](https://learn.microsoft.com/en-us/windows/wsl/about).

With WSL2 all environment variables will be correctly set without having to use `cross-env`.

📋 TODO LIST - Reliquary Module Completion

🔴 1. DATA NOT LOADED EVERYWHERE YET

High Priority - Stub Hooks Need Implementation

- lib/useRelicBurn.tsx (lines 1-13) Currently: Stub returning console.log TODO: Implement actual
  burn transaction logic
- lib/useRelicHarvestRewards.tsx (lines 1-13) Currently: Stub returning console.log TODO: Implement
  actual harvest rewards transaction logic
- lib/useReliquaryLevelUp.tsx (lines 1-13) Currently: Stub returning console.log TODO: Implement
  actual level up transaction logic
- lib/useRelicPendingRewards.tsx (lines 12-13) Currently: Returns empty array [] TODO: Implement
  contract call to fetch pending rewards
- Duplicate useGetHHRewards implementations Files: lib/useGetHHRewards.tsx (stub) vs
  hooks/useGetHHRewards.ts (working) TODO: Remove stub version or consolidate - the one in /hooks/
  is already implemented with real API call

Medium Priority - Missing Data Implementation

- lib/useBatchRelayerHasApprovedForAll.tsx (lines 7-8) Currently: Returns false hardcoded TODO:
  Implement contract call to check batch relayer approval status
- lib/useRelicDepositBalance.tsx (lines 6-7) Currently: USD value uses hardcoded 1.0 multiplier
  TODO: Implement proper USD value calculation using actual token prices
- ReliquaryProvider.tsx (lines 115, 143) Currently: farmId hardcoded to '0' TODO: Get farmId from
  network configuration instead of hardcoding

---

🟡 2. COMPONENTS STUBBED/NEED REPLACEMENT

High Priority

- components/RelicCarousel.tsx (lines 33-36) Currently: ReliquaryInvestModal commented out TODO:
  Implement or uncomment the modal for minting new relics (or verify it's replaced by /add-liquidity
  route)

Medium Priority - Clean Up Commented Code

- components/RelicSlideInfo.tsx (lines 110-119) Currently: BEETS per day display commented out TODO:
  Either implement properly or remove commented code
- components/RelicCarousel.tsx (lines 89-97) Currently: Dummy slide logic commented out TODO: Review
  if needed for empty state, clean up if not
- components/RelicSlideApr.tsx (lines 49-52) Currently: useEffect for loading states commented out
  TODO: Either implement properly or remove

---

🟢 3. UNDELEGATE BUTTON → MODAL FLOW

- components/DelegateClearButton.tsx (entire file) Currently: Direct action via step.renderAction()
  TODO: Convert to modal flow with confirmation (like ClaimModal, LevelUpModal, BurnModal)
- components/DelegateSetButton.tsx (entire file) Currently: Direct action via step.renderAction()
  TODO: Convert to modal flow with confirmation

---

🎨 4. STYLING/LAYOUT FIXES (Compare with Original)

Medium Priority - Layout Issues

- ReliquaryLanding.tsx (line 189) Currently: mt={{ base: '32rem', lg: '16' }} - suspiciously large
  mobile margin TODO: Review layout - this may be compensating for absolute positioning issue
- Swiper Hydration Hack - components/RelicCarousel.tsx (lines 16, 22-24) & components/RelicSlide.tsx
  (lines 62-65) Currently: "hack to get around next.js hydration issues" TODO: Find proper solution
  for Next.js hydration with Swiper, consolidate workaround

Low Priority - Clean Up

- ReliquaryLanding.tsx (line 35) Currently: console.log('landing') debug code TODO: Remove debug
  logging
- components/ReliquaryHeroBanner.tsx (line 48) Currently: <ul style={{ textAlign: 'left' }}> TODO:
  Convert to Chakra List component with textAlign prop
- components/RelicSlide.tsx (line 237) Currently: style={{ marginTop: '0 !important' }} TODO: Remove
  !important, fix via proper Chakra styling
- components/RelicSlide.tsx (line 244) Currently: style={{ cursor: 'pointer' }} TODO: Convert to
  Chakra cursor prop
- components/Relic.tsx (lines 113-114) Currently: "wrapped in monospace font for now to prevent
  jittering" TODO: Find better solution for preventing number jittering
- Various commented styles in RelicSlideApr.tsx, ReliquaryLiquidityChart.tsx TODO: Either implement
  or remove commented-out properties

/**
 * Pool detail page — parameter timeline + impact visualization.
 *
 * This is the analytics surface; it does NOT replace frontend-v3's pool
 * page (no swap / add-liquidity actions, no positions). The goal is to
 * align parameter-change events with metric series so a viewer can see
 * how a swap-fee or amp-factor change correlates with TVL / volume / fees
 * over the following days.
 *
 * Data flow:
 *   - api-v3 `poolGetPool`           — pool metadata for the header
 *   - api-v3 `poolGetSnapshots(90d)` — continuous metric series
 *   - `readUniversalV3State` + `readStableTypeState` — current params via
 *     VaultExplorer + pool getters multicall
 *
 * The drpc-derived event timeline (`syncPoolEvents`) used to be fetched
 * here too, but it's the page's slow path (multi-second log walk on cold
 * pools) and was blocking the entire render. It now streams in via the
 * client-side `usePoolEvents` hook (lib/hooks/usePoolEvents.ts) which hits
 * `/api/pool/[chain]/[id]/events` after the shell paints.
 *
 * Functions are called server-side directly (no HTTP roundtrip through
 * the /api routes) — the routes exist as a public surface for external
 * consumers / debugging, not as a coupling for the page.
 */

import { notFound } from 'next/navigation'
import type { Address } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { ChainSlug, getChainSlug } from '@repo/lib/modules/pool/pool.utils'
import { isDrpcSupportedChain } from '@analytics/lib/contracts/drpc-endpoints'
import { UpstreamError, gqlFetch as gqlFetchUpstream } from '@analytics/lib/upstream/gql'
import {
  readBufferStates,
  readGyroEclpTypeState,
  readLbpTypeState,
  readQuantAmmTypeState,
  readReclammTypeState,
  readStableSurgeState,
  readStableTypeState,
  readUniversalV3State,
  readV2BasePoolState,
  readV2StableTypeState,
  readWeightedTypeState,
  type BufferState,
  type GyroEclpTypeState,
  type LbpTypeState,
  type QuantAmmTypeState,
  type ReclammTypeState,
  type StableSurgeState,
  type StableTypeState,
  type UniversalV3State,
  type V2BasePoolState,
  type WeightedTypeState,
} from '@analytics/lib/pool-state/read'
import type { PoolParamEvent } from '@analytics/lib/pool-events/types'
import { scrubError } from '@analytics/lib/drpc/scrub'
import { PoolPageView } from './_components/PoolPageView'
import { PoolPageUpstreamNotice } from './_components/PoolPageUpstreamNotice'

export const dynamic = 'force-dynamic'

const API_URL =
  process.env.NEXT_PUBLIC_BALANCER_API_URL ?? 'https://api-v3.balancer.fi/graphql'

type RouteParams = { chain: string; id: string }

export type PoolDetail = {
  id: string
  address: string
  name: string
  symbol: string
  type: string
  protocolVersion: 1 | 2 | 3
  /** Sub-version within the protocol (e.g. 1 = StablePool v1, 2 = v2). */
  version: number | null
  chain: GqlChain
  createTime: number
  factory: string | null
  swapFeeManager: string | null
  pauseManager: string | null
  poolCreator: string | null
  /** True when at least one pool token is an ERC4626 wrapper — gates the
   *  boosted-pool modules without needing to scan tokens client-side. */
  hasErc4626: boolean
  tokens: PoolDetailToken[]
  /** Share-price of the LP token in normalized units, scaled by the rate
   *  providers attached to the pool. Surfaced only on V3 stable variants
   *  (`STABLE`, `COMPOSABLE_STABLE`); `null` otherwise. */
  bptPriceRate: string | null
  /** When true, the pool rejects unbalanced add/remove liquidity — only
   *  proportional liquidity is allowed. Surfaces as a badge on the fee
   *  card so depositors know what flows are available. */
  disableUnbalancedLiquidity: boolean | null
}

/** Snapshot of the security review for a token's price-rate provider.
 *  Pulled from api-v3's `priceRateProviderData`. The analytics rate-
 *  providers section uses `reviewed` + `summary` + `warnings` to badge
 *  each row with a "safe / warnings / unreviewed" status, mirroring
 *  frontend-v3's `getRateProviderIcon`. */
export type PriceRateProviderData = {
  name: string | null
  summary: string | null
  reviewed: boolean
  warnings: string[] | null
  reviewFile: string | null
  factory: string | null
}

export type PoolDetailToken = {
  address: string
  symbol: string
  decimals: number
  weight: string | null
  logoURI: string | null
  /** Pool's current balance of this token in human-readable units. */
  balance: string
  balanceUSD: string
  /** ERC4626 conversion factor (wrapped → underlying). 1 for non-wrapped. */
  priceRate: string
  /** Address of the rate-provider contract feeding `priceRate`. `null`
   *  when the token uses no rate provider (the Vault treats it as 1:1). */
  priceRateProvider: string | null
  /** Security review snapshot for the rate provider above, or `null`
   *  when api-v3 has no review entry. The analytics card surfaces this
   *  as a status icon + warning tooltip per row. */
  priceRateProviderData: PriceRateProviderData | null
  /** ERC4626-only fields. `isErc4626` gates whether the rest are meaningful;
   *  api-v3 returns `null` for `maxDeposit`/`maxWithdraw`/`underlyingToken`
   *  on non-wrapped tokens. */
  isErc4626: boolean
  maxDeposit: string | null
  maxWithdraw: string | null
  canUseBufferForSwaps: boolean | null
  useUnderlyingForAddRemove: boolean | null
  useWrappedForAddRemove: boolean | null
  underlyingToken: {
    address: string
    symbol: string
    decimals: number
    logoURI: string | null
  } | null
  erc4626ReviewData: {
    summary: string
    warnings: string[]
  } | null
}

export type PoolSnapshot = {
  timestamp: number
  totalLiquidity: number
  volume24h: number
  fees24h: number
  surplus24h: number
  sharePrice: number
}

/** Per-token weight snapshot from api-v3. `weights[i]` aligns with
 *  `poolDetail.tokens[i]`. Fractions, e.g. 0.5 = 50%. */
export type QuantAmmWeightSnapshot = {
  timestamp: number
  weights: number[] | null
}

/** Slimmed view of api-v3's `QuantAmmWeightedParams` — only the fields the
 *  analytics weight-shift card surfaces. Strings preserved as-is (api-v3
 *  returns 1e18-scaled big-decimal strings); formatting happens at render. */
export type QuantAmmWeightedParams = {
  lambda: string[]
  weightsAtLastUpdateInterval: string[]
  weightBlockMultipliers: string[]
  updateInterval: string
  lastUpdateIntervalTime: string
  lastInterpolationTimePossible: string
  epsilonMax: string
  absoluteWeightGuardRail: string
  maxTradeSizeRatio: string
  oracleStalenessThreshold: string
}

export type PoolHistoryRange = '30d' | '90d' | '180d' | '1y' | 'all'

export type PoolPageData = {
  poolDetail: PoolDetail
  snapshots: PoolSnapshot[]
  events: PoolParamEvent[]
  lastBlock: number
  /** Active range selector value — drives the chart header label, the
   *  range toggle, and whether the event scan ran in full-history mode. */
  range: PoolHistoryRange
  /** Derived: any range > 90d ran the full-history event scan. Kept on the
   *  payload for components that just want a binary "did we deep-scan?". */
  fullHistory: boolean
  state: {
    universal: UniversalV3State | null
    stable: StableTypeState | null
    v2Base: V2BasePoolState | null
    /** V3 type-specific params for the panel's lower section. At most one
     *  of these is non-null per pool (dispatched on `poolDetail.type`);
     *  `stableSurge` is additive on STABLE pools that have the hook. */
    weighted: WeightedTypeState | null
    gyroEclp: GyroEclpTypeState | null
    reclamm: ReclammTypeState | null
    lbp: LbpTypeState | null
    quantAmm: QuantAmmTypeState | null
    stableSurge: StableSurgeState | null
    /** Buffer state per ERC4626 token, one entry per wrapped token in
     *  `poolDetail.tokens`. Only populated on v3 boosted pools — `null`
     *  on v2, non-boosted v3, and chains without a VaultExplorer entry. */
    bufferStates: BufferState[] | null
  }
  /** QuantAMM/BTF history from api-v3. Only populated for pools of type
   *  `QUANT_AMM_WEIGHTED`; `null` everywhere else. Snapshots are sorted by
   *  ascending timestamp on the server but we re-sort defensively at the
   *  boundary. `params` mirrors `quantAmmWeightedParams` on the api-v3
   *  pool union. */
  quantAmm: {
    weightSnapshots: QuantAmmWeightSnapshot[]
    params: QuantAmmWeightedParams | null
  } | null
}

const POOL_DETAIL_QUERY = /* GraphQL */ `
  query AnalyticsPoolDetail($id: String!, $chain: GqlChain!) {
    poolGetPool(id: $id, chain: $chain) {
      id
      address
      name
      symbol
      type
      protocolVersion
      version
      chain
      createTime
      factory
      swapFeeManager
      pauseManager
      poolCreator
      hasErc4626
      # Surfaces "proportional liquidity only" on the analytics fee card.
      # Available on every GqlPoolBase variant, so requested at the root.
      liquidityManagement {
        disableUnbalancedLiquidity
      }
      poolTokens {
        address
        symbol
        decimals
        weight
        logoURI
        balance
        balanceUSD
        priceRate
        # Rate-provider surface — drives the "Rate providers" section.
        # priceRateProvider is the address; priceRateProviderData is the
        # security review snapshot (reviewed/safe/warnings/factory).
        priceRateProvider
        priceRateProviderData {
          name
          summary
          reviewed
          warnings
          reviewFile
          factory
        }
        isErc4626
        maxDeposit
        maxWithdraw
        canUseBufferForSwaps
        useUnderlyingForAddRemove
        useWrappedForAddRemove
        underlyingToken {
          address
          symbol
          decimals
          logoURI
        }
        erc4626ReviewData {
          summary
          warnings
        }
      }
      # BPT (LP token) rate, exposed on the V3 stable variants only — for
      # boosted stable pools this should climb monotonically as the
      # rate-providers accrue yield. Inline-fragmented because MetaStable
      # (V2) doesn't expose it.
      ... on GqlPoolStable {
        bptPriceRate
      }
      ... on GqlPoolComposableStable {
        bptPriceRate
      }
      # QuantAMM/BTF-specific fields. api-v3 returns these only on
      # GqlPoolQuantAmmWeighted; the inline fragment keeps the payload free
      # for every other pool type. weightSnapshots drive the stacked-area
      # chart; quantAmmWeightedParams powers the rule-parameters card.
      ... on GqlPoolQuantAmmWeighted {
        weightSnapshots {
          timestamp
          weights
        }
        quantAmmWeightedParams {
          lambda
          weightsAtLastUpdateInterval
          weightBlockMultipliers
          updateInterval
          lastUpdateIntervalTime
          lastInterpolationTimePossible
          epsilonMax
          absoluteWeightGuardRail
          maxTradeSizeRatio
          oracleStalenessThreshold
        }
      }
    }
  }
`

const SNAPSHOTS_QUERY = /* GraphQL */ `
  query AnalyticsPoolSnapshots(
    $id: String!
    $chain: GqlChain!
    $range: GqlPoolSnapshotDataRange!
  ) {
    snapshots: poolGetSnapshots(id: $id, chain: $chain, range: $range) {
      timestamp
      totalLiquidity
      volume24h
      fees24h
      surplus24h
      sharePrice
    }
  }
`

/**
 * Surface viem `HttpRequestError` fields that JSON stringification drops,
 * with the drpc API key scrubbed from URLs and messages before logging.
 */
function logRpcError(label: string, chain: GqlChain, pool: string, err: unknown): void {
  console.error(label, { chain, pool, ...scrubError(err) })
}

/** Default Next Data Cache TTL for api-v3 GraphQL fetches on this page.
 *  Pool metadata and daily snapshots both update on the order of hours at
 *  most; a 60s window lets click-arounds dedupe (key = request body) without
 *  letting newly-changed pools sit stale long. `?refresh` overrides this to
 *  `cache: 'no-store'`, preserving the documented bypass path. */
const POOL_FETCH_REVALIDATE_SECONDS = 60

/** Thin wrapper around the shared `gqlFetch` so the existing call sites
 *  keep their (query, variables, label, options) signature. Rate-limit
 *  detection, GraphQL error handling, and the typed `UpstreamError`
 *  throw all live in `lib/upstream/gql.ts` now and are shared with the
 *  other api-v3 callers in the app. */
async function gqlFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  label: string,
  options: { forceFresh?: boolean } = {}
): Promise<T | null> {
  return gqlFetchUpstream<T>(API_URL, query, variables, {
    upstream: 'api-v3',
    label,
    cache: options.forceFresh ? 'no-store' : { revalidate: POOL_FETCH_REVALIDATE_SECONDS },
  })
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<RouteParams>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<React.JSX.Element> {
  const { chain: chainSlug, id } = await params
  const search = await searchParams
  // `?refresh` (or `?refresh=1`) on the URL forces the sync to ignore the
  // 30s TTL and re-scan from the cold floor. Useful for inspecting a pool
  // whose first sync hit a transient drpc error and left the table empty.
  const forceRefresh = search.refresh !== undefined

  // `?range=30d|90d|180d|1y|all` (default 90d). Drives both the api-v3
  // snapshot enum AND the event-scan window — see `RANGE_*` constants
  // below. `?fullHistory` (legacy URL form) maps to `?range=all` for
  // backwards compat so old links keep working.
  type HistoryRange = '30d' | '90d' | '180d' | '1y' | 'all'
  const VALID_RANGES: ReadonlySet<HistoryRange> = new Set(['30d', '90d', '180d', '1y', 'all'])
  function parseRange(raw: unknown): HistoryRange {
    if (typeof raw === 'string' && VALID_RANGES.has(raw as HistoryRange)) {
      return raw as HistoryRange
    }
    return '90d'
  }
  const rawRange = Array.isArray(search.range) ? search.range[0] : search.range
  const range: HistoryRange =
    search.fullHistory !== undefined && search.range === undefined
      ? 'all'
      : parseRange(rawRange)

  // Snapshot enum per range. 30d uses the 90-day fetch and trims client-side
  // (api-v3 has no 30-day enum). The longer ranges round-trip directly.
  const SNAPSHOT_RANGE: Record<HistoryRange, string> = {
    '30d': 'NINETY_DAYS',
    '90d': 'NINETY_DAYS',
    '180d': 'ONE_HUNDRED_EIGHTY_DAYS',
    '1y': 'ONE_YEAR',
    all: 'ALL_TIME',
  }
  // Any range > 90d triggers the one-time full-history event scan so the
  // chart's event markers can land anywhere on the visible x-axis. After
  // the first deep scan, `pool_sync_state.deep_synced` latches and all
  // future visits (any range) serve fast from the DB. Backwards-compat:
  // legacy `fullHistory` was treated as `all` above.
  const fullHistory = range !== '30d' && range !== '90d'

  let chain: GqlChain
  try {
    chain = getChainSlug(chainSlug.toLowerCase() as ChainSlug)
  } catch {
    console.warn('[pool/page] 404: invalid chain slug', { chainSlug, id })
    notFound()
  }
  if (!(PROJECT_CONFIG.supportedNetworks as readonly GqlChain[]).includes(chain)) {
    console.warn('[pool/page] 404: chain not in PROJECT_CONFIG.supportedNetworks', {
      chain,
      supported: PROJECT_CONFIG.supportedNetworks,
    })
    notFound()
  }
  if (!isDrpcSupportedChain(chain)) {
    console.warn('[pool/page] 404: chain not drpc-supported', { chain })
    notFound()
  }
  // Accept either form:
  //  - 42-char address (0x + 40 hex) — canonical for V3 pools (where
  //    `pool.id === pool.address`) and also a usable shorthand for V2.
  //  - 66-char poolId (0x + 64 hex) — required for V2 / CowAmm pools, whose
  //    `id` is `address` + 2-byte type + 2-byte nonce.
  if (!/^0x[a-fA-F0-9]{40}([a-fA-F0-9]{24})?$/.test(id)) {
    console.warn('[pool/page] 404: invalid pool address or poolId', { id })
    notFound()
  }

  const rawId = id.toLowerCase()
  // Contract address used for on-chain calls (drpc) is always the first 20
  // bytes. For 42-char input that's the whole string; for 66-char input we
  // slice off the trailing type+nonce bytes.
  const contractAddress = rawId.length === 66 ? rawId.slice(0, 42) : rawId
  // api-v3 expects the canonical pool id. V3 pools use the 42-char address
  // as their id (`pool.id === pool.address`); V2/CowAmm pools use the
  // 66-char form (`address + 2-byte type + 2-byte nonce`). The URL itself
  // is the canonical id — `poolGetPool(id, chain)` returns the pool for
  // either shape directly. There used to be a `poolGetPools(where: {
  // addressIn: [...] })` fallback for users who typed a V2 pool's 42-char
  // address, but api-v3 removed `addressIn` from `GqlPoolFilter` (verified
  // via introspection 2026-05-20). With no address-keyed lookup left, V2
  // pools must be reached via their 66-char poolId; the gqlFetch logging
  // above surfaces the api-v3 "Pool with id does not exist" error so a
  // user typing the wrong form sees it in the dev log.
  const apiV3Id = rawId

  // Wrap the api-v3 fetches so an upstream failure (rate limit, 5xx,
  // GraphQL error) renders a transparent notice instead of the misleading
  // "page not found" the old `gqlFetch returns null → notFound()` flow
  // produced. A genuine "this pool doesn't exist" still falls through to
  // the `!detailRes?.poolGetPool` branch below as before.
  type DetailRes = {
    poolGetPool: {
      id: string
      address: string
      name: string
      symbol: string
      type: string
      protocolVersion: number
      version: number | null
      chain: GqlChain
      createTime: number
      factory: string | null
      swapFeeManager: string | null
      pauseManager: string | null
      poolCreator: string | null
      hasErc4626: boolean
      liquidityManagement: { disableUnbalancedLiquidity: boolean | null } | null
      poolTokens: {
        address: string
        symbol: string
        decimals: number
        weight: string | null
        logoURI: string | null
        balance: string
        balanceUSD: string
        priceRate: string
        priceRateProvider: string | null
        priceRateProviderData: {
          name: string | null
          summary: string | null
          reviewed: boolean
          warnings: string[] | null
          reviewFile: string | null
          factory: string | null
        } | null
        isErc4626: boolean
        maxDeposit: string | null
        maxWithdraw: string | null
        canUseBufferForSwaps: boolean | null
        useUnderlyingForAddRemove: boolean | null
        useWrappedForAddRemove: boolean | null
        underlyingToken: {
          address: string
          symbol: string
          decimals: number
          logoURI: string | null
        } | null
        erc4626ReviewData: {
          summary: string
          warnings: string[]
        } | null
      }[]
      // V3 stable variants only — `bptPriceRate` is in the inline fragment
      // on `GqlPoolStable` / `GqlPoolComposableStable`; absent everywhere
      // else (MetaStable / weighted / gyro / …).
      bptPriceRate?: string | null
      // Present only on QUANT_AMM_WEIGHTED pools via the inline fragment;
      // undefined otherwise. Optional fields keep the type honest for
      // every other pool type that flows through this query.
      weightSnapshots?: { timestamp: number; weights: number[] | null }[] | null
      quantAmmWeightedParams?: {
        lambda: string[]
        weightsAtLastUpdateInterval: string[]
        weightBlockMultipliers: string[]
        updateInterval: string
        lastUpdateIntervalTime: string
        lastInterpolationTimePossible: string
        epsilonMax: string
        absoluteWeightGuardRail: string
        maxTradeSizeRatio: string
        oracleStalenessThreshold: string
      } | null
    }
  }
  // api-v3 returns `BigDecimal` values as JSON strings — the on-wire shape
  // diverges from the `PoolSnapshot` type below, which surfaces real numbers
  // to consumers. We parse once at the boundary so downstream code never
  // has to second-guess the runtime type.
  type RawSnapshot = {
    timestamp: number
    totalLiquidity: string
    volume24h: string
    fees24h: string
    surplus24h: string
    sharePrice: string
  }
  type SnapshotsRes = { snapshots: RawSnapshot[] }

  // Pool detail + snapshots are fast (api-v3 only, ~200–500ms each). They're
  // all the data the page needs to render the header, snapshot tile, and
  // chart shell. The previously-blocking `syncPoolEvents` call — a drpc log
  // walk that can run 10–20s on cold pools — has been moved to a client-
  // side hook (`usePoolEvents`) that streams the event timeline in after
  // the shell paints. The page now feels instant on first visit even when
  // the indexer hasn't seen the pool before.
  let detailRes: DetailRes | null
  let snapshotsRes: SnapshotsRes | null
  try {
    ;[detailRes, snapshotsRes] = await Promise.all([
      gqlFetch<DetailRes>(
        POOL_DETAIL_QUERY,
        { id: apiV3Id, chain },
        'poolGetPool',
        { forceFresh: forceRefresh }
      ),
      gqlFetch<SnapshotsRes>(
        SNAPSHOTS_QUERY,
        { id: apiV3Id, chain, range: SNAPSHOT_RANGE[range] },
        'poolGetSnapshots',
        { forceFresh: forceRefresh }
      ),
    ])
  } catch (err) {
    if (err instanceof UpstreamError) {
      return <PoolPageUpstreamNotice chainSlug={chainSlug} error={err} poolId={id} />
    }
    throw err
  }

  if (!detailRes?.poolGetPool) {
    console.warn('[pool/page] 404: api-v3 has no pool for input id', {
      chain,
      rawId,
      contractAddress,
      hint:
        rawId.length === 42
          ? 'V3 pools use the 42-char address as id; V2/CowAmm pools require the 66-char poolId. If this is a V2 pool, retry with the full poolId.'
          : 'check api-v3 logs above (the gqlFetch wrapper logs HTTP errors and GraphQL errors).',
    })
    notFound()
  }

  const poolDetail: PoolDetail = {
    ...detailRes.poolGetPool,
    protocolVersion: detailRes.poolGetPool.protocolVersion as 1 | 2 | 3,
    tokens: detailRes.poolGetPool.poolTokens.map(t => ({
      address: t.address,
      symbol: t.symbol,
      decimals: t.decimals,
      weight: t.weight,
      logoURI: t.logoURI,
      balance: t.balance,
      balanceUSD: t.balanceUSD,
      priceRate: t.priceRate,
      priceRateProvider: t.priceRateProvider,
      priceRateProviderData: t.priceRateProviderData,
      isErc4626: t.isErc4626,
      maxDeposit: t.maxDeposit,
      maxWithdraw: t.maxWithdraw,
      canUseBufferForSwaps: t.canUseBufferForSwaps,
      useUnderlyingForAddRemove: t.useUnderlyingForAddRemove,
      useWrappedForAddRemove: t.useWrappedForAddRemove,
      underlyingToken: t.underlyingToken,
      erc4626ReviewData: t.erc4626ReviewData,
    })),
    bptPriceRate: detailRes.poolGetPool.bptPriceRate ?? null,
    disableUnbalancedLiquidity:
      detailRes.poolGetPool.liquidityManagement?.disableUnbalancedLiquidity ?? null,
  }

  // State reads dispatch on the resolved pool protocol version. V3 uses
  // VaultExplorer + FeeController for universal state, V2 reads directly
  // off the pool contract.
  let universal: UniversalV3State | null = null
  let stable: StableTypeState | null = null
  let v2Base: V2BasePoolState | null = null
  let weighted: WeightedTypeState | null = null
  let gyroEclp: GyroEclpTypeState | null = null
  let reclamm: ReclammTypeState | null = null
  let lbp: LbpTypeState | null = null
  let quantAmm: QuantAmmTypeState | null = null
  let stableSurge: StableSurgeState | null = null
  let bufferStates: BufferState[] | null = null
  const isStable = poolDetail.type === 'STABLE' || poolDetail.type === 'COMPOSABLE_STABLE'

  // Wrap a state read so a single reverting helper-contract call degrades to
  // `null` (panel falls back to universal state) instead of failing render.
  const rescue = <T,>(label: string, p: Promise<T | null>): Promise<T | null> =>
    p.catch((err: unknown) => {
      logRpcError(`[pool/page] ${label} failed`, chain, contractAddress, err)
      return null
    })

  if (poolDetail.protocolVersion === 3) {
    const addr = contractAddress as Address
    const t = poolDetail.type
    // Buffer reads only when the pool actually has ERC4626 tokens — saves
    // a multicall on plain v3 pools, which are the majority.
    const wrappedAddrs = poolDetail.hasErc4626
      ? poolDetail.tokens
          .filter(token => token.isErc4626)
          .map(token => token.address as Address)
      : []
    // One read per lane, dispatched on pool type. At most one type-specific
    // read fires (others resolve to `null` synchronously); `stableSurge` is
    // additive on STABLE pools and self-nulls when the hook isn't attached.
    const [u, s, w, ge, rc, l, qa, ss, bs] = await Promise.all([
      rescue('readUniversalV3State', readUniversalV3State(chain, addr)),
      isStable ? rescue('readStableTypeState', readStableTypeState(chain, addr)) : null,
      t === 'WEIGHTED' ? rescue('readWeightedTypeState', readWeightedTypeState(chain, addr)) : null,
      t === 'GYROE' ? rescue('readGyroEclpTypeState', readGyroEclpTypeState(chain, addr)) : null,
      t === 'RECLAMM' ? rescue('readReclammTypeState', readReclammTypeState(chain, addr)) : null,
      t === 'LIQUIDITY_BOOTSTRAPPING'
        ? rescue('readLbpTypeState', readLbpTypeState(chain, addr))
        : null,
      t === 'QUANT_AMM_WEIGHTED'
        ? rescue('readQuantAmmTypeState', readQuantAmmTypeState(chain, addr))
        : null,
      isStable ? rescue('readStableSurgeState', readStableSurgeState(chain, addr)) : null,
      wrappedAddrs.length > 0
        ? rescue('readBufferStates', readBufferStates(chain, wrappedAddrs))
        : null,
    ])
    universal = u
    stable = s
    weighted = w
    gyroEclp = ge
    reclamm = rc
    lbp = l
    quantAmm = qa
    stableSurge = ss
    bufferStates = bs
  } else if (poolDetail.protocolVersion === 2) {
    const [b, s] = await Promise.all([
      readV2BasePoolState(chain, contractAddress as Address).catch((err: unknown) => {
        logRpcError('[pool/page] readV2BasePoolState failed', chain, contractAddress, err)
        return null
      }),
      isStable
        ? readV2StableTypeState(chain, contractAddress as Address).catch((err: unknown) => {
            logRpcError(
              '[pool/page] readV2StableTypeState failed',
              chain,
              contractAddress,
              err
            )
            return null
          })
        : Promise.resolve(null),
    ])
    v2Base = b
    stable = s
  }

  // For the 30d range we fetched the 90-day snapshot enum (api-v3 has no
  // 30d enum) and trim to the latest-30-days window. We anchor the cutoff
  // on the *latest snapshot timestamp* rather than `Date.now()` — pure
  // function of the input, no clock dependency in the render path, and
  // naturally robust to stale series where "now" is past the last point.
  // Coerce api-v3's BigDecimal strings to JS numbers up front. NaN-on-bad-
  // input is acceptable here — every metric formatter downstream already
  // handles that case (the chart's interpolators and the snapshot tile's
  // Intl.NumberFormat call both pass NaN through as "—"-style fallbacks).
  const rawSnapshots: PoolSnapshot[] = (snapshotsRes?.snapshots ?? []).map(s => ({
    timestamp: s.timestamp,
    totalLiquidity: Number(s.totalLiquidity),
    volume24h: Number(s.volume24h),
    fees24h: Number(s.fees24h),
    surplus24h: Number(s.surplus24h),
    sharePrice: Number(s.sharePrice),
  }))
  // Drop any snapshot timestamped before the pool was deployed. api-v3
  // occasionally back-fills the snapshot series with a leading zero-TVL
  // bucket whose timestamp falls in the day *before* `createTime`, which
  // the chart then renders as a dip from nowhere. Anchoring on
  // `poolDetail.createTime` removes those phantom points without affecting
  // legitimate history.
  let trimmedSnapshots = poolDetail.createTime
    ? rawSnapshots.filter(s => s.timestamp >= poolDetail.createTime)
    : rawSnapshots
  if (range === '30d' && trimmedSnapshots.length > 0) {
    let latest = 0
    for (const s of trimmedSnapshots) if (s.timestamp > latest) latest = s.timestamp
    const cutoff = latest - 30 * 86400
    trimmedSnapshots = trimmedSnapshots.filter(s => s.timestamp >= cutoff)
  }

  // QuantAMM history slice — only populated when the pool actually came
  // back with the inline-fragment fields. Snapshots are sorted ascending
  // by timestamp so the chart hook can render without re-sorting on every
  // render. `weights` may be null for an individual snapshot (api-v3
  // back-fills with null when the contract hadn't been read yet at that
  // point in history); we keep those entries so the gap shows in the
  // chart rather than silently interpolating across.
  const rawWeightSnapshots = detailRes.poolGetPool.weightSnapshots
  const quantAmmHistory =
    poolDetail.type === 'QUANT_AMM_WEIGHTED'
      ? {
          weightSnapshots: (rawWeightSnapshots ?? [])
            .slice()
            .sort((a, b) => a.timestamp - b.timestamp)
            .map(s => ({ timestamp: s.timestamp, weights: s.weights ?? null })),
          params: detailRes.poolGetPool.quantAmmWeightedParams ?? null,
        }
      : null

  const data: PoolPageData = {
    poolDetail,
    snapshots: trimmedSnapshots,
    // Events are no longer fetched on the page's critical path — they
    // stream in via `usePoolEvents` on the client. The page-level value
    // stays as an empty array so the existing components don't have to
    // handle a separate "events are loading" prop; the hook surfaces the
    // loading state directly to the chart's indexing chip.
    events: [],
    lastBlock: 0,
    range,
    fullHistory,
    state: {
      universal,
      stable,
      v2Base,
      weighted,
      gyroEclp,
      reclamm,
      lbp,
      quantAmm,
      stableSurge,
      bufferStates,
    },
    quantAmm: quantAmmHistory,
  }

  return <PoolPageView data={data} />
}

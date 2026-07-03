/**
 * Current pool state via helper-contract `multicall`.
 *
 * Two-layer dispatch:
 *   1. `readUniversalV3State` — VaultExplorer reads common to every V3
 *      pool: swap fee, aggregate fees, paused, recovery mode. One
 *      multicall per pool.
 *   2. `readTypeSpecificState` — pool-type-aware extras (amp factor + ramp
 *      for Stable, weights for Weighted, surge params for StableSurge…).
 *      Phase B ships Stable only.
 *
 * Helper-contract addresses come from `lib/contracts/v3-addresses.ts`. When
 * an address is `null` (chain not yet populated), the corresponding read
 * returns `null` rather than throwing — the page degrades to chart +
 * event timeline only.
 */

import 'server-only'
import {
  type Abi,
  type Address,
  type ContractFunctionParameters,
  parseAbi,
} from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getPublicClient } from '@analytics/lib/drpc/client'
import { getV3HelperAddresses } from '@analytics/lib/contracts/v3-addresses'

// Minimal ABIs — only the getters we actually call. Keeping them inlined
// (rather than re-importing the full deployed ABIs) makes the multicall
// type-safe and keeps bundle weight irrelevant.

const VAULT_EXPLORER_ABI = parseAbi([
  'function getStaticSwapFeePercentage(address pool) view returns (uint256)',
  'function getAggregateFeePercentages(address pool) view returns (uint256 swapFee, uint256 yieldFee)',
  'function isPoolPaused(address pool) view returns (bool)',
  'function isPoolInRecoveryMode(address pool) view returns (bool)',
  'function getBufferBalance(address wrappedToken) view returns (uint256 underlyingBalance, uint256 wrappedBalance)',
  'function isERC4626BufferInitialized(address wrappedToken) view returns (bool)',
  'function getBufferTotalShares(address wrappedToken) view returns (uint256)',
]) satisfies Abi

const STABLE_POOL_ABI = parseAbi([
  'function getAmplificationParameter() view returns (uint256 value, bool isUpdating, uint256 precision)',
  'function getAmplificationState() view returns ((uint64 startValue, uint64 endValue, uint32 startTime, uint32 endTime) amplificationState, uint256 precision)',
  // V3 stable pools inherit these bounds from the BasePoolFactory. Older
  // deployments without the upgrade revert on the call — `allowFailure`
  // in the multicall lets the read degrade to `null` per slot.
  'function getMinimumSwapFeePercentage() view returns (uint256)',
  'function getMaximumSwapFeePercentage() view returns (uint256)',
  // `getTokenInfo` is part of the V3 pool surface and returns the Vault's
  // per-token registration tuple: standard / withRate type, rate provider
  // address, and the yield-fee opt-in flag.
  'function getTokenInfo() view returns (address[] tokens, (uint8 tokenType, address rateProvider, bool paysYieldFees)[] tokenInfo, uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)',
]) satisfies Abi

const FEE_CONTROLLER_ABI = parseAbi([
  'function getPoolCreatorSwapFeePercentage(address pool) view returns (uint256)',
  'function getPoolCreatorYieldFeePercentage(address pool) view returns (uint256)',
]) satisfies Abi

// V2 pools emit their getters directly (no VaultExplorer in V2). All V2
// pool types — Weighted, Stable, ComposableStable, etc. — inherit the
// base-pool surface, so these readers work uniformly across them.
const V2_BASE_POOL_ABI = parseAbi([
  'function getSwapFeePercentage() view returns (uint256)',
  'function getPausedState() view returns (bool paused, uint256 pauseWindowEndTime, uint256 bufferPeriodEndTime)',
  'function inRecoveryMode() view returns (bool)',
  'function getProtocolFeePercentageCache(uint256 feeType) view returns (uint256)',
]) satisfies Abi

const V2_STABLE_POOL_ABI = parseAbi([
  'function getAmplificationParameter() view returns (uint256 value, bool isUpdating, uint256 precision)',
]) satisfies Abi

// ── V3 type-specific ABIs (every signature verified on a live pool, see
//    POOL_EXPLORER_DESIGN.md §5: hand-curated, on-chain-verified) ──

const V3_WEIGHTED_ABI = parseAbi([
  'function getNormalizedWeights() view returns (uint256[])',
]) satisfies Abi

// GyroECLP. `getECLPParams` returns the 5 human-meaningful ECLP params plus
// a derived-params struct of math internals (tau vectors etc.) we don't
// surface — decoded only so viem can walk past it.
const V3_GYRO_ECLP_ABI = parseAbi([
  'function getECLPParams() view returns ((int256 alpha, int256 beta, int256 c, int256 s, int256 lambda) params, ((int256 x, int256 y) tauAlpha, (int256 x, int256 y) tauBeta, int256 u, int256 v, int256 w, int256 z, int256 dSq) derived)',
]) satisfies Abi

const V3_RECLAMM_ABI = parseAbi([
  'function computeCurrentPriceRatio() view returns (uint256)',
  'function computeCurrentPriceRange() view returns (uint256 minPrice, uint256 maxPrice)',
  'function computeCurrentVirtualBalances() view returns (uint256 virtualBalanceA, uint256 virtualBalanceB, bool changed)',
  // Returns the per-token live balances as 1e18-scaled values (the Vault
  // normalizes every pool token to 18-decimal internally). Pairs with
  // virtualBalances under the same scaling so the margin math in the
  // section component sees consistent units. Spot price is derived from
  // these on the client (matches frontend-v3) — no `computeCurrentSpotPrice`
  // call because that function isn't present on every reCLAMM deployment.
  'function getCurrentLiveBalances() view returns (uint256[] balancesLiveScaled18)',
  'function getCenterednessMargin() view returns (uint256)',
  'function getDailyPriceShiftExponent() view returns (uint256)',
  'function isPoolWithinTargetRange() view returns (bool)',
  'function getLastTimestamp() view returns (uint256)',
  'function getPriceRatioState() view returns ((uint96 startFourthRootPriceRatio, uint96 endFourthRootPriceRatio, uint32 priceRatioUpdateStartTime, uint32 priceRatioUpdateEndTime))',
]) satisfies Abi

const V3_LBP_ABI = parseAbi([
  'function isSwapEnabled() view returns (bool)',
  'function getNormalizedWeights() view returns (uint256[])',
  'function getGradualWeightUpdateParams() view returns (uint256 startTime, uint256 endTime, uint256[] startWeights, uint256[] endWeights)',
]) satisfies Abi

const V3_QUANT_AMM_ABI = parseAbi([
  'function getNormalizedWeights() view returns (uint256[])',
  'function getWithinFixWindow() view returns (bool)',
  'function getOracleStalenessThreshold() view returns (uint256)',
]) satisfies Abi

// StableSurge hook is a separate contract, keyed by pool. Addresses come
// from v3-addresses.ts (active + legacy). Both getters take the pool.
const V3_STABLE_SURGE_HOOK_ABI = parseAbi([
  'function getSurgeThresholdPercentage(address pool) view returns (uint256)',
  'function getMaxSurgeFeePercentage(address pool) view returns (uint256)',
]) satisfies Abi

// V2 protocol-fee types (from balancer-v2-monorepo IProtocolFeePercentagesProvider).
// Used to query the per-pool fee cache. We don't expose the AUM type
// because no current pool surfaces it in analytics; add later if needed.
const V2_FEE_TYPE_SWAP = 0n
const V2_FEE_TYPE_YIELD = 2n

export type UniversalV3State = {
  swapFeePercentage: string
  aggregateSwapFeePercentage: string
  aggregateYieldFeePercentage: string
  poolCreatorSwapFeePercentage: string | null
  poolCreatorYieldFeePercentage: string | null
  isPaused: boolean
  isInRecoveryMode: boolean
}

export type V2BasePoolState = {
  swapFeePercentage: string
  isPaused: boolean
  pauseWindowEndTime: number
  bufferPeriodEndTime: number
  /** V2 added recovery mode mid-lifecycle — pre-fork pools don't implement
   *  `inRecoveryMode()` so the call may fail. `null` means "not exposed". */
  isInRecoveryMode: boolean | null
  /** Protocol swap fee cache (1e18-scaled). Reflects the snapshot of the
   *  protocol fee that was last committed for this pool. `null` if the
   *  pool doesn't implement the cache (older Weighted variants). */
  protocolSwapFeeCache: string | null
  /** Protocol yield fee cache. Same caveats as above; non-yield pools
   *  return zero rather than null. */
  protocolYieldFeeCache: string | null
}

export type StableTypeState = {
  amplificationParameter: {
    value: string
    isUpdating: boolean
    precision: string
  }
  amplificationState: {
    startValue: string
    endValue: string
    startTime: number
    endTime: number
    precision: string
  }
  /** Hard guard-rails the fee setter operates inside. 1e18-scaled strings,
   *  V3 only. `null` when the contract doesn't expose the bound (older
   *  variants) or when reading from a V2 path. */
  swapFeeMin: string | null
  swapFeeMax: string | null
  /** Per-token metadata from `getTokenInfo`, ordered to match
   *  `poolDetail.tokens` (the Vault returns tokens in registration order,
   *  which is the order api-v3 surfaces too). `null` when the read failed
   *  or the pool's on V2. */
  tokenInfo: Array<{
    /** `0 = STANDARD`, `1 = WITH_RATE`. ERC4626 wrappers show as `WITH_RATE`
     *  with a non-zero `rateProvider`. */
    tokenType: number
    rateProvider: string
    paysYieldFees: boolean
  }> | null
}

/** All weight/percentage values are 1e18-scaled decimal strings; the
 *  inspector divides as needed. Time fields are unix seconds. */
export type WeightedTypeState = { normalizedWeights: string[] }

export type GyroEclpTypeState = {
  alpha: string
  beta: string
  c: string
  s: string
  lambda: string
}

export type ReclammTypeState = {
  /** Current ratio of max/min price (1e18-scaled). */
  currentPriceRatio: string
  /** Current minimum price of the active range (1e18-scaled, token B per
   *  token A — same orientation the contract uses internally). */
  minPrice: string
  /** Current maximum price of the active range. */
  maxPrice: string
  /** Virtual balances after the contract's just-in-time recompute, 1e18
   *  fixed-point scaled. Combined with `liveBalance{A,B}` these give the
   *  invariant and let the section compute lower/upper margin prices —
   *  i.e. the boundaries of the green "target range" band on the chart. */
  virtualBalanceA: string
  virtualBalanceB: string
  /** Live token balances, 1e18 fixed-point scaled (the Vault normalizes
   *  every pool token to 18 decimals internally — so a 6-decimal USDC
   *  balance of 1.0 reads as `1e18` here too). */
  liveBalanceA: string
  liveBalanceB: string
  /** Centeredness margin (1e18-scaled fraction). The pool starts shifting
   *  to recenter once centeredness drops below this margin. */
  centerednessMargin: string
  /** Daily price-shift exponent (1e18-scaled fraction). Caps how much the
   *  bounds can drift per day when out-of-center. */
  dailyPriceShiftExponent: string
  /** Last on-chain interaction timestamp. Bounds drift is keyed off this. */
  lastTimestamp: number
  isWithinTargetRange: boolean
  priceRatio: {
    start: string
    end: string
    startTime: number
    endTime: number
  }
}

export type LbpTypeState = {
  swapEnabled: boolean
  normalizedWeights: string[]
  update: {
    startTime: number
    endTime: number
    startWeights: string[]
    endWeights: string[]
  }
}

export type QuantAmmTypeState = {
  normalizedWeights: string[]
  withinFixWindow: boolean
  oracleStalenessThreshold: number
}

export type StableSurgeState = {
  surgeThresholdPercentage: string
  maxSurgeFeePercentage: string
}

export async function readUniversalV3State(
  chain: GqlChain,
  poolAddress: Address
): Promise<UniversalV3State | null> {
  const helpers = getV3HelperAddresses(chain)
  if (!helpers?.vaultExplorer) return null

  const client = getPublicClient(chain)

  // Build multicall: 4 reads against VaultExplorer + 2 against the
  // ProtocolFeeController (when present).
  const explorerCalls: ContractFunctionParameters[] = [
    {
      address: helpers.vaultExplorer,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'getStaticSwapFeePercentage',
      args: [poolAddress],
    },
    {
      address: helpers.vaultExplorer,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'getAggregateFeePercentages',
      args: [poolAddress],
    },
    {
      address: helpers.vaultExplorer,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'isPoolPaused',
      args: [poolAddress],
    },
    {
      address: helpers.vaultExplorer,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'isPoolInRecoveryMode',
      args: [poolAddress],
    },
  ]

  const feeControllerCalls: ContractFunctionParameters[] = helpers.protocolFeeController
    ? [
        {
          address: helpers.protocolFeeController,
          abi: FEE_CONTROLLER_ABI,
          functionName: 'getPoolCreatorSwapFeePercentage',
          args: [poolAddress],
        },
        {
          address: helpers.protocolFeeController,
          abi: FEE_CONTROLLER_ABI,
          functionName: 'getPoolCreatorYieldFeePercentage',
          args: [poolAddress],
        },
      ]
    : []

  const results = await client.multicall({
    contracts: [...explorerCalls, ...feeControllerCalls],
    allowFailure: true,
  })

  // Bail if the core VaultExplorer reads failed — the pool likely isn't
  // registered on V3 (could be a V2 address that the caller passed by
  // mistake).
  if (results[0].status !== 'success') return null

  const swapFee = results[0].result as bigint
  const aggregate = results[1].result as readonly [bigint, bigint] | undefined
  const aggregateSwap = aggregate?.[0] ?? 0n
  const aggregateYield = aggregate?.[1] ?? 0n
  const paused = (results[2].result as boolean | undefined) ?? false
  const recovery = (results[3].result as boolean | undefined) ?? false

  let poolCreatorSwap: string | null = null
  let poolCreatorYield: string | null = null
  if (feeControllerCalls.length) {
    const swapResult = results[explorerCalls.length]
    const yieldResult = results[explorerCalls.length + 1]
    if (swapResult?.status === 'success') {
      poolCreatorSwap = (swapResult.result as bigint).toString()
    }
    if (yieldResult?.status === 'success') {
      poolCreatorYield = (yieldResult.result as bigint).toString()
    }
  }

  return {
    swapFeePercentage: swapFee.toString(),
    aggregateSwapFeePercentage: aggregateSwap.toString(),
    aggregateYieldFeePercentage: aggregateYield.toString(),
    poolCreatorSwapFeePercentage: poolCreatorSwap,
    poolCreatorYieldFeePercentage: poolCreatorYield,
    isPaused: paused,
    isInRecoveryMode: recovery,
  }
}

export async function readStableTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<StableTypeState | null> {
  const client = getPublicClient(chain)
  // Five-slot multicall: amp params/state + the two swap-fee bounds + the
  // per-token tokenInfo tuple. `allowFailure` lets older pool variants
  // (which lack the bounds or tokenInfo getters) still surface the amp
  // params without erroring the whole read.
  const results = await client.multicall({
    contracts: [
      {
        address: poolAddress,
        abi: STABLE_POOL_ABI,
        functionName: 'getAmplificationParameter',
      },
      {
        address: poolAddress,
        abi: STABLE_POOL_ABI,
        functionName: 'getAmplificationState',
      },
      {
        address: poolAddress,
        abi: STABLE_POOL_ABI,
        functionName: 'getMinimumSwapFeePercentage',
      },
      {
        address: poolAddress,
        abi: STABLE_POOL_ABI,
        functionName: 'getMaximumSwapFeePercentage',
      },
      {
        address: poolAddress,
        abi: STABLE_POOL_ABI,
        functionName: 'getTokenInfo',
      },
    ],
    allowFailure: true,
  })

  if (results[0].status !== 'success') return null
  const param = results[0].result as readonly [bigint, boolean, bigint]
  const stateOk = results[1].status === 'success'
  const stateTuple = stateOk
    ? (results[1].result as readonly [
        { startValue: bigint; endValue: bigint; startTime: number; endTime: number },
        bigint,
      ])
    : null
  const swapFeeMin =
    results[2].status === 'success' ? (results[2].result as bigint).toString() : null
  const swapFeeMax =
    results[3].status === 'success' ? (results[3].result as bigint).toString() : null
  // `getTokenInfo` returns `(IERC20[] tokens, TokenInfo[] tokenInfo,
  // uint256[] balancesRaw, uint256[] lastBalancesLiveScaled18)`. Only the
  // tokenInfo struct array is relevant here — we already have balances
  // from api-v3.
  let tokenInfo: StableTypeState['tokenInfo'] = null
  if (results[4].status === 'success') {
    const tuple = results[4].result as readonly [
      readonly string[],
      readonly {
        tokenType: number
        rateProvider: string
        paysYieldFees: boolean
      }[],
      readonly bigint[],
      readonly bigint[],
    ]
    tokenInfo = tuple[1].map(t => ({
      tokenType: Number(t.tokenType),
      rateProvider: t.rateProvider,
      paysYieldFees: t.paysYieldFees,
    }))
  }

  return {
    amplificationParameter: {
      value: param[0].toString(),
      isUpdating: param[1],
      precision: param[2].toString(),
    },
    amplificationState: stateTuple
      ? {
          startValue: stateTuple[0].startValue.toString(),
          endValue: stateTuple[0].endValue.toString(),
          startTime: Number(stateTuple[0].startTime),
          endTime: Number(stateTuple[0].endTime),
          precision: stateTuple[1].toString(),
        }
      : {
          // Fallback when `getAmplificationState` isn't available (older
          // pool variants): synthesize a degenerate state with the current
          // value so the inspector still renders without conditional UI.
          startValue: param[0].toString(),
          endValue: param[0].toString(),
          startTime: 0,
          endTime: 0,
          precision: param[2].toString(),
        },
    swapFeeMin,
    swapFeeMax,
    tokenInfo,
  }
}

/**
 * Current state for every V2 pool type. Reads come from the pool contract
 * directly — no VaultExplorer in V2. All calls are wrapped in `allowFailure`
 * so a pre-fork pool that lacks `inRecoveryMode()` or the protocol fee
 * cache still returns a partial state object instead of throwing.
 */
export async function readV2BasePoolState(
  chain: GqlChain,
  poolAddress: Address
): Promise<V2BasePoolState | null> {
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: [
      {
        address: poolAddress,
        abi: V2_BASE_POOL_ABI,
        functionName: 'getSwapFeePercentage',
      },
      {
        address: poolAddress,
        abi: V2_BASE_POOL_ABI,
        functionName: 'getPausedState',
      },
      {
        address: poolAddress,
        abi: V2_BASE_POOL_ABI,
        functionName: 'inRecoveryMode',
      },
      {
        address: poolAddress,
        abi: V2_BASE_POOL_ABI,
        functionName: 'getProtocolFeePercentageCache',
        args: [V2_FEE_TYPE_SWAP],
      },
      {
        address: poolAddress,
        abi: V2_BASE_POOL_ABI,
        functionName: 'getProtocolFeePercentageCache',
        args: [V2_FEE_TYPE_YIELD],
      },
    ],
    allowFailure: true,
  })

  // If `getSwapFeePercentage` itself failed, the pool isn't a V2 pool we
  // can read — likely wrong protocol version or invalid address. Return
  // null so callers can decide whether to surface a placeholder.
  if (results[0].status !== 'success') return null

  const swapFee = results[0].result as bigint
  const pausedTuple = results[1].status === 'success'
    ? (results[1].result as readonly [boolean, bigint, bigint])
    : null
  const recoveryRaw = results[2].status === 'success' ? (results[2].result as boolean) : null
  const protocolSwap =
    results[3].status === 'success' ? (results[3].result as bigint).toString() : null
  const protocolYield =
    results[4].status === 'success' ? (results[4].result as bigint).toString() : null

  return {
    swapFeePercentage: swapFee.toString(),
    isPaused: pausedTuple?.[0] ?? false,
    pauseWindowEndTime: pausedTuple ? Number(pausedTuple[1]) : 0,
    bufferPeriodEndTime: pausedTuple ? Number(pausedTuple[2]) : 0,
    isInRecoveryMode: recoveryRaw,
    protocolSwapFeeCache: protocolSwap,
    protocolYieldFeeCache: protocolYield,
  }
}

/**
 * V2 Stable / ComposableStable amp factor. Reuses the V3 `StableTypeState`
 * shape because the inspector renders identically across versions. V2
 * doesn't expose `getAmplificationState()` (no scheduled ramp accessor) —
 * the inspector still works because we synthesize a degenerate state with
 * the current value, the same fallback path V3 uses for older variants.
 */
export async function readV2StableTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<StableTypeState | null> {
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: [
      {
        address: poolAddress,
        abi: V2_STABLE_POOL_ABI,
        functionName: 'getAmplificationParameter',
      },
    ],
    allowFailure: true,
  })

  if (results[0].status !== 'success') return null
  const param = results[0].result as readonly [bigint, boolean, bigint]
  return {
    amplificationParameter: {
      value: param[0].toString(),
      isUpdating: param[1],
      precision: param[2].toString(),
    },
    amplificationState: {
      startValue: param[0].toString(),
      endValue: param[0].toString(),
      startTime: 0,
      endTime: 0,
      precision: param[2].toString(),
    },
    // V2 stable pools don't expose swap-fee bounds or `getTokenInfo` — the
    // bounds live on the V2 BasePool's protocol fee cache and tokenInfo
    // lives on the Vault, neither of which is in `StableTypeState`'s
    // scope. The fields are `null` here so the inspector knows to hide
    // those Tier-2 rows for V2 pools.
    swapFeeMin: null,
    swapFeeMax: null,
    tokenInfo: null,
  }
}

// ── V3 type-specific readers ───────────────────────────────────────────────
// Each is a single `eth_call` (or one small multicall) against the pool
// contract. They return `null` on failure so the page degrades to the
// universal panel rather than erroring (DESIGN §10.5).

const toStrs = (xs: readonly bigint[]): string[] => xs.map(x => x.toString())

/** V3 Weighted (and any pool exposing `getNormalizedWeights`). */
export async function readWeightedTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<WeightedTypeState | null> {
  const client = getPublicClient(chain)
  try {
    const w = (await client.readContract({
      address: poolAddress,
      abi: V3_WEIGHTED_ABI,
      functionName: 'getNormalizedWeights',
    })) as readonly bigint[]
    return { normalizedWeights: toStrs(w) }
  } catch {
    return null
  }
}

/** GyroECLP — the 5 human-meaningful params (alpha/beta/c/s/lambda). */
export async function readGyroEclpTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<GyroEclpTypeState | null> {
  const client = getPublicClient(chain)
  try {
    const res = (await client.readContract({
      address: poolAddress,
      abi: V3_GYRO_ECLP_ABI,
      functionName: 'getECLPParams',
    })) as readonly [
      { alpha: bigint; beta: bigint; c: bigint; s: bigint; lambda: bigint },
      unknown,
    ]
    const p = res[0]
    return {
      alpha: p.alpha.toString(),
      beta: p.beta.toString(),
      c: p.c.toString(),
      s: p.s.toString(),
      lambda: p.lambda.toString(),
    }
  } catch {
    return null
  }
}

/** AutoRange (contract type `RECLAMM`) — full live state for the bounds
 *  visualization: price ratio, min/max range, spot price, live + virtual
 *  balances, centeredness, shift exponent, range status, last interaction,
 *  and the price-ratio update schedule. One multicall, every read in
 *  `allowFailure` so a partial-result still surfaces the values we did
 *  get. Function name keeps the legacy `reclamm` token to match the
 *  contract type slug callers dispatch on (`poolDetail.type === 'RECLAMM'`). */
export async function readReclammTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<ReclammTypeState | null> {
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: [
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'computeCurrentPriceRatio' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'computeCurrentPriceRange' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'computeCurrentVirtualBalances' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'getCurrentLiveBalances' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'getCenterednessMargin' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'getDailyPriceShiftExponent' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'isPoolWithinTargetRange' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'getLastTimestamp' },
      { address: poolAddress, abi: V3_RECLAMM_ABI, functionName: 'getPriceRatioState' },
    ],
    allowFailure: true,
  })
  if (results[0].status !== 'success') return null
  const range = results[1].status === 'success'
    ? (results[1].result as readonly [bigint, bigint])
    : null
  const vb = results[2].status === 'success'
    ? (results[2].result as readonly [bigint, bigint, boolean])
    : null
  const lb = results[3].status === 'success'
    ? (results[3].result as readonly bigint[])
    : null
  const prs = results[8].status === 'success'
    ? (results[8].result as {
        startFourthRootPriceRatio: bigint
        endFourthRootPriceRatio: bigint
        priceRatioUpdateStartTime: number
        priceRatioUpdateEndTime: number
      })
    : null
  return {
    currentPriceRatio: (results[0].result as bigint).toString(),
    minPrice: range ? range[0].toString() : '0',
    maxPrice: range ? range[1].toString() : '0',
    virtualBalanceA: vb ? vb[0].toString() : '0',
    virtualBalanceB: vb ? vb[1].toString() : '0',
    liveBalanceA: lb && lb.length >= 2 ? lb[0].toString() : '0',
    liveBalanceB: lb && lb.length >= 2 ? lb[1].toString() : '0',
    centerednessMargin:
      results[4].status === 'success' ? (results[4].result as bigint).toString() : '0',
    dailyPriceShiftExponent:
      results[5].status === 'success' ? (results[5].result as bigint).toString() : '0',
    isWithinTargetRange:
      results[6].status === 'success' ? (results[6].result as boolean) : false,
    lastTimestamp:
      results[7].status === 'success' ? Number(results[7].result as bigint) : 0,
    priceRatio: prs
      ? {
          start: prs.startFourthRootPriceRatio.toString(),
          end: prs.endFourthRootPriceRatio.toString(),
          startTime: Number(prs.priceRatioUpdateStartTime),
          endTime: Number(prs.priceRatioUpdateEndTime),
        }
      : { start: '0', end: '0', startTime: 0, endTime: 0 },
  }
}

/** V3 LBP — current weights, swap-enabled flag, gradual-weight schedule. */
export async function readLbpTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<LbpTypeState | null> {
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: [
      { address: poolAddress, abi: V3_LBP_ABI, functionName: 'getNormalizedWeights' },
      { address: poolAddress, abi: V3_LBP_ABI, functionName: 'isSwapEnabled' },
      { address: poolAddress, abi: V3_LBP_ABI, functionName: 'getGradualWeightUpdateParams' },
    ],
    allowFailure: true,
  })
  if (results[0].status !== 'success') return null
  const upd = results[2].status === 'success'
    ? (results[2].result as readonly [bigint, bigint, readonly bigint[], readonly bigint[]])
    : null
  return {
    normalizedWeights: toStrs(results[0].result as readonly bigint[]),
    swapEnabled: results[1].status === 'success' ? (results[1].result as boolean) : false,
    update: upd
      ? {
          startTime: Number(upd[0]),
          endTime: Number(upd[1]),
          startWeights: toStrs(upd[2]),
          endWeights: toStrs(upd[3]),
        }
      : { startTime: 0, endTime: 0, startWeights: [], endWeights: [] },
  }
}

/** QuantAMM — current dynamic weights + oracle window params. */
export async function readQuantAmmTypeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<QuantAmmTypeState | null> {
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: [
      { address: poolAddress, abi: V3_QUANT_AMM_ABI, functionName: 'getNormalizedWeights' },
      { address: poolAddress, abi: V3_QUANT_AMM_ABI, functionName: 'getWithinFixWindow' },
      { address: poolAddress, abi: V3_QUANT_AMM_ABI, functionName: 'getOracleStalenessThreshold' },
    ],
    allowFailure: true,
  })
  if (results[0].status !== 'success') return null
  return {
    normalizedWeights: toStrs(results[0].result as readonly bigint[]),
    withinFixWindow: results[1].status === 'success' ? (results[1].result as boolean) : false,
    oracleStalenessThreshold:
      results[2].status === 'success' ? Number(results[2].result as bigint) : 0,
  }
}

/**
 * StableSurge hook params for a pool. The hook is a separate contract; a
 * pool may be registered against the active or a legacy deployment, so we
 * probe every configured hook and take the first that answers. Returns
 * `null` when the pool has no surge hook (every probe reverts) or the chain
 * has no configured hooks.
 */
export async function readStableSurgeState(
  chain: GqlChain,
  poolAddress: Address
): Promise<StableSurgeState | null> {
  const helpers = getV3HelperAddresses(chain)
  if (!helpers?.stableSurgeHooks?.length) return null
  const client = getPublicClient(chain)
  const results = await client.multicall({
    contracts: helpers.stableSurgeHooks.flatMap(hook => [
      {
        address: hook,
        abi: V3_STABLE_SURGE_HOOK_ABI,
        functionName: 'getSurgeThresholdPercentage',
        args: [poolAddress],
      },
      {
        address: hook,
        abi: V3_STABLE_SURGE_HOOK_ABI,
        functionName: 'getMaxSurgeFeePercentage',
        args: [poolAddress],
      },
    ]),
    allowFailure: true,
  })
  for (let i = 0; i < results.length; i += 2) {
    const threshold = results[i]
    const maxFee = results[i + 1]
    if (threshold.status !== 'success') continue
    const t = (threshold.result as bigint).toString()
    const m = maxFee.status === 'success' ? (maxFee.result as bigint).toString() : '0'
    // The hook's getter falls back to a default-zero response for pools
    // that aren't actually registered with it (the call doesn't revert —
    // it just returns zero). Treat both-zero as "not attached" so the
    // Manage card stops suggesting tunings on plain stable pools that
    // never opted into the surge hook.
    if (t === '0' && m === '0') continue
    return {
      surgeThresholdPercentage: t,
      maxSurgeFeePercentage: m,
    }
  }
  return null
}

// ── ERC4626 buffer state ────────────────────────────────────────────────
//
// The V3 Vault keeps a per-wrapped-token buffer that holds both the
// underlying and the wrapped (yield-bearing) form so swap paths can wrap
// or unwrap without round-tripping to the underlying ERC4626 vault on
// every trade. api-v3 surfaces `maxDeposit` / `maxWithdraw` (the wrapper's
// own caps) but NOT the buffer's internal `(underlying, wrapped)` split —
// that lives on-chain only. This read fills that gap.

/** Per-wrapped-token buffer state. Raw u256 strings — the consumer
 *  formats with the matching token's decimals. `null` underlying/wrapped
 *  means the multicall slot failed (chain doesn't have a VaultExplorer
 *  on it, the wrapped isn't a registered buffer, etc.); the panel falls
 *  back to capacity-bars-only for that row. */
export type BufferState = {
  /** Wrapped (ERC4626) token address. Lowercased to match api-v3. */
  wrappedToken: string
  /** Raw u256 underlying-token balance held by the buffer, in the
   *  underlying's decimals. Null when the read failed. */
  underlyingBalanceRaw: string | null
  /** Raw u256 wrapped-token balance held by the buffer, in the wrapped
   *  token's own decimals. Null when the read failed. */
  wrappedBalanceRaw: string | null
  /** True if `Vault.initializeBuffer` has been called for this wrapper.
   *  When false the buffer is empty and the pool can't avoid wrapping
   *  on each swap that touches this token. */
  isInitialized: boolean | null
  /** Raw u256 total of internal buffer shares (LP accounting). Null on
   *  read failure. */
  totalSharesRaw: string | null
}

export async function readBufferStates(
  chain: GqlChain,
  wrappedTokens: readonly Address[]
): Promise<BufferState[] | null> {
  if (wrappedTokens.length === 0) return []
  const helpers = getV3HelperAddresses(chain)
  if (!helpers?.vaultExplorer) return null

  const client = getPublicClient(chain)

  // 3 reads per wrapped token: balance (2 values, 1 call), init status,
  // total shares. allowFailure handles wrappers that aren't (yet) buffer-
  // initialized — those revert on getBufferBalance instead of returning
  // zeros, so we mark the slot null rather than throwing the whole batch.
  const contracts: ContractFunctionParameters[] = wrappedTokens.flatMap(addr => [
    {
      address: helpers.vaultExplorer as Address,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'getBufferBalance',
      args: [addr],
    },
    {
      address: helpers.vaultExplorer as Address,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'isERC4626BufferInitialized',
      args: [addr],
    },
    {
      address: helpers.vaultExplorer as Address,
      abi: VAULT_EXPLORER_ABI,
      functionName: 'getBufferTotalShares',
      args: [addr],
    },
  ])

  const results = await client.multicall({ contracts, allowFailure: true })

  return wrappedTokens.map((addr, i) => {
    const balResult = results[i * 3]
    const initResult = results[i * 3 + 1]
    const sharesResult = results[i * 3 + 2]

    let underlyingBalanceRaw: string | null = null
    let wrappedBalanceRaw: string | null = null
    if (balResult?.status === 'success') {
      const [u, w] = balResult.result as readonly [bigint, bigint]
      underlyingBalanceRaw = u.toString()
      wrappedBalanceRaw = w.toString()
    }
    const isInitialized =
      initResult?.status === 'success' ? (initResult.result as boolean) : null
    const totalSharesRaw =
      sharesResult?.status === 'success'
        ? (sharesResult.result as bigint).toString()
        : null

    return {
      wrappedToken: addr.toLowerCase(),
      underlyingBalanceRaw,
      wrappedBalanceRaw,
      isInitialized,
      totalSharesRaw,
    }
  })
}

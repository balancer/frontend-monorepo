/**
 * Event signatures consumed by the pool param sync — single source of truth.
 *
 * `lib/abis/*.ts` holds the full deployed ABIs (functions + events + errors)
 * for helper-contract reads in the `/state` route. For `eth_getLogs` we only
 * need event entries, and we want them as a known-narrow tuple so viem's
 * `getLogs({ events })` can discriminate the result type by `eventName`.
 *
 * Defined via `parseAbi` rather than re-extracting from the JSON ABI so:
 *   1. The set of *tracked* events is explicit in one file (the JSON ABIs
 *      contain many events we deliberately ignore, e.g. `Approval`, `Swap`).
 *   2. The signatures are readable in diff review.
 *   3. `as const` keeps the array literal-typed for viem's type narrowing.
 *
 * Splits mirror §5 of `POOL_EXPLORER_DESIGN.md`:
 *   - Filter A: events emitted by the Vault / FeeController / SurgeHook,
 *     each carrying `address indexed pool` as their first arg. One
 *     `eth_getLogs` call covers the whole group filtered by `topics[1]`.
 *   - Filter B: events emitted by the pool contract itself, no indexed
 *     pool. Filter via `address = poolAddress`.
 */

import { parseAbi } from 'viem'

// ── Filter A: indexed-pool events ──────────────────────────────────────────

export const V3_VAULT_POOL_EVENTS = parseAbi([
  'event SwapFeePercentageChanged(address indexed pool, uint256 swapFeePercentage)',
  'event AggregateSwapFeePercentageChanged(address indexed pool, uint256 aggregateSwapFeePercentage)',
  'event AggregateYieldFeePercentageChanged(address indexed pool, uint256 aggregateYieldFeePercentage)',
  'event PoolPausedStateChanged(address indexed pool, bool paused)',
  'event PoolRecoveryModeStateChanged(address indexed pool, bool recoveryMode)',
  'event PoolRegistered(address indexed pool, address indexed factory)',
] as const)

export const V3_FEE_CONTROLLER_POOL_EVENTS = parseAbi([
  'event PoolCreatorSwapFeePercentageChanged(address indexed pool, uint256 poolCreatorSwapFeePercentage)',
  'event PoolCreatorYieldFeePercentageChanged(address indexed pool, uint256 poolCreatorYieldFeePercentage)',
  'event ProtocolSwapFeePercentageChanged(address indexed pool, uint256 protocolSwapFeePercentage)',
  'event ProtocolYieldFeePercentageChanged(address indexed pool, uint256 protocolYieldFeePercentage)',
  'event InitialPoolAggregateSwapFeePercentage(address indexed pool, uint256 aggregateSwapFeePercentage)',
  'event InitialPoolAggregateYieldFeePercentage(address indexed pool, uint256 aggregateYieldFeePercentage)',
  'event PoolRegisteredWithFeeController(address indexed pool, address indexed factory)',
] as const)

export const V3_STABLE_SURGE_HOOK_EVENTS = parseAbi([
  'event ThresholdSurgePercentageChanged(address indexed pool, uint256 newSurgeThresholdPercentage)',
  'event MaxSurgeFeePercentageChanged(address indexed pool, uint256 newMaxSurgeFeePercentage)',
  'event StableSurgeHookRegistered(address indexed pool, address indexed factory)',
] as const)

// ── Filter B: pool-emitted events (no indexed pool) ────────────────────────

export const V3_STABLE_POOL_EVENTS = parseAbi([
  'event AmpUpdateStarted(uint256 startValue, uint256 endValue, uint256 startTime, uint256 endTime)',
  'event AmpUpdateStopped(uint256 currentValue)',
] as const)

export const V2_BASE_POOL_EVENTS = parseAbi([
  'event SwapFeePercentageChanged(uint256 swapFeePercentage)',
  'event PausedStateChanged(bool paused)',
  'event RecoveryModeStateChanged(bool enabled)',
  'event ProtocolFeePercentageCacheUpdated(uint256 indexed feeType, uint256 protocolFeePercentage)',
] as const)

export const V2_STABLE_POOL_EVENTS = parseAbi([
  'event AmpUpdateStarted(uint256 startValue, uint256 endValue, uint256 startTime, uint256 endTime)',
  'event AmpUpdateStopped(uint256 currentValue)',
] as const)

// ── Convenience unions ─────────────────────────────────────────────────────

/** Filter A union for V3 — pass as `events` in a single `eth_getLogs` call. */
export const V3_FILTER_A_EVENTS = [
  ...V3_VAULT_POOL_EVENTS,
  ...V3_FEE_CONTROLLER_POOL_EVENTS,
  ...V3_STABLE_SURGE_HOOK_EVENTS,
] as const

/** Filter B union for V3 Stable pools. */
export const V3_STABLE_FILTER_B_EVENTS = V3_STABLE_POOL_EVENTS

/** Filter B union for V2 Stable / ComposableStable pools (base + amp). */
export const V2_STABLE_FILTER_B_EVENTS = [
  ...V2_BASE_POOL_EVENTS,
  ...V2_STABLE_POOL_EVENTS,
] as const

/** Filter B union for V2 non-Stable pools (weighted, etc.) — base only. */
export const V2_NON_STABLE_FILTER_B_EVENTS = V2_BASE_POOL_EVENTS

/**
 * Pure helpers for the compare-mode panel.
 *
 *   computeParamSnapshot(events, t)   — walk events ≤ t, derive each tracked
 *                                       parameter's value at that moment.
 *   interpolateTvl(snapshots, t)      — linearly interpolate TVL at t.
 *   sumWindow(snapshots, ta, tb, k)   — sum a daily-bucket field over the
 *                                       inclusive [ta, tb] window.
 *   diffSnapshots(a, b)               — list of param keys that differ.
 *
 * Lives outside `/_components` so it can be imported by both the toolbar
 * (client) and unit-test contexts. No `'use client'` directive — pure ESM,
 * no React.
 *
 * Args shape conventions:
 *   - 1e18-scaled percentages and amp values stay as decimal strings (no
 *     parsing here; the inspector formats).
 *   - Booleans stay boolean.
 *   - Timestamps inside args are decimal strings (uint256 → string via the
 *     `toJsonSafe` decoder) and are `Number()`'d when needed.
 */
import type { PoolParamEvent } from './types'

export type ParamSnapshot = {
  // V3 Vault + InitialPool* events (FeeController publishes the t0 initial)
  swapFeePercentage?: string
  aggregateSwapFeePercentage?: string
  aggregateYieldFeePercentage?: string

  // V3 ProtocolFeeController per-pool overrides
  poolCreatorSwapFeePercentage?: string
  poolCreatorYieldFeePercentage?: string
  protocolSwapFeePercentage?: string
  protocolYieldFeePercentage?: string

  // V3 StableSurge hook
  surgeThresholdPercentage?: string
  maxSurgeFeePercentage?: string

  // Operational state (V3 + V2 — args differ but both fold into the same
  // boolean fields after the events are decoded).
  paused?: boolean
  recoveryMode?: boolean

  // Amp factor — interpolated when the timestamp falls inside an active
  // `AmpUpdateStarted` ramp; otherwise just the last `AmpUpdateStopped` /
  // ramp end value.
  ampValue?: string
  ampIsRamping?: boolean
}

/** Linearly interpolate the BigInt amp value between `start` and `end` at
 *  parameter `t ∈ [0, 1]`. We use BigInt math to avoid losing precision on
 *  uint256-sized values. Fractional `t` is scaled to fixed-point first
 *  (1e6 buckets is plenty for daily-resolution time interpolation). */
function lerpBigDecimal(startDec: string, endDec: string, t: number): string {
  const start = BigInt(startDec)
  const end = BigInt(endDec)
  const T = BigInt(Math.round(Math.max(0, Math.min(1, t)) * 1_000_000))
  return (start + ((end - start) * T) / 1_000_000n).toString()
}

export function computeParamSnapshot(
  events: readonly PoolParamEvent[],
  timestamp: number
): ParamSnapshot {
  const snap: ParamSnapshot = {}
  let ampRamp: {
    start: string
    end: string
    startTime: number
    endTime: number
  } | null = null

  // Process strictly chronologically; the caller passes the same events
  // for both cursors so sorting once per call is fine for the scales we
  // expect (≤ a few hundred per pool).
  const ordered = [...events]
    .filter(e => e.blockTimestamp <= timestamp)
    .sort((a, b) => a.blockTimestamp - b.blockTimestamp || a.logIndex - b.logIndex)

  for (const e of ordered) {
    const a = e.args
    switch (e.eventName) {
      // ── V3 Vault per-pool fees ────────────────────────────────────────
      case 'SwapFeePercentageChanged':
        if (typeof a.swapFeePercentage === 'string') snap.swapFeePercentage = a.swapFeePercentage
        break
      case 'AggregateSwapFeePercentageChanged':
        if (typeof a.aggregateSwapFeePercentage === 'string') {
          snap.aggregateSwapFeePercentage = a.aggregateSwapFeePercentage
        }
        break
      case 'AggregateYieldFeePercentageChanged':
        if (typeof a.aggregateYieldFeePercentage === 'string') {
          snap.aggregateYieldFeePercentage = a.aggregateYieldFeePercentage
        }
        break
      case 'InitialPoolAggregateSwapFeePercentage':
        // Use only as a t0 seed — explicit AggregateSwapFeePercentageChanged
        // events overwrite this when they land later in the stream.
        if (
          typeof a.aggregateSwapFeePercentage === 'string' &&
          snap.aggregateSwapFeePercentage === undefined
        ) {
          snap.aggregateSwapFeePercentage = a.aggregateSwapFeePercentage
        }
        break
      case 'InitialPoolAggregateYieldFeePercentage':
        if (
          typeof a.aggregateYieldFeePercentage === 'string' &&
          snap.aggregateYieldFeePercentage === undefined
        ) {
          snap.aggregateYieldFeePercentage = a.aggregateYieldFeePercentage
        }
        break

      // ── V3 ProtocolFeeController per-pool overrides ───────────────────
      case 'PoolCreatorSwapFeePercentageChanged':
        if (typeof a.poolCreatorSwapFeePercentage === 'string') {
          snap.poolCreatorSwapFeePercentage = a.poolCreatorSwapFeePercentage
        }
        break
      case 'PoolCreatorYieldFeePercentageChanged':
        if (typeof a.poolCreatorYieldFeePercentage === 'string') {
          snap.poolCreatorYieldFeePercentage = a.poolCreatorYieldFeePercentage
        }
        break
      case 'ProtocolSwapFeePercentageChanged':
        if (typeof a.protocolSwapFeePercentage === 'string') {
          snap.protocolSwapFeePercentage = a.protocolSwapFeePercentage
        }
        break
      case 'ProtocolYieldFeePercentageChanged':
        if (typeof a.protocolYieldFeePercentage === 'string') {
          snap.protocolYieldFeePercentage = a.protocolYieldFeePercentage
        }
        break

      // ── V3 StableSurge hook ───────────────────────────────────────────
      case 'ThresholdSurgePercentageChanged':
        if (typeof a.newSurgeThresholdPercentage === 'string') {
          snap.surgeThresholdPercentage = a.newSurgeThresholdPercentage
        }
        break
      case 'MaxSurgeFeePercentageChanged':
        if (typeof a.newMaxSurgeFeePercentage === 'string') {
          snap.maxSurgeFeePercentage = a.newMaxSurgeFeePercentage
        }
        break

      // ── Operational state (V3 + V2 both fold here) ────────────────────
      case 'PoolPausedStateChanged':
      case 'PausedStateChanged':
        snap.paused = a.paused === true
        break
      case 'PoolRecoveryModeStateChanged':
        snap.recoveryMode = a.recoveryMode === true
        break
      case 'RecoveryModeStateChanged':
        // V2 uses `enabled` (decoded from `bool enabled`).
        snap.recoveryMode = a.enabled === true
        break

      // ── Amp ramps ─────────────────────────────────────────────────────
      case 'AmpUpdateStarted':
        if (
          typeof a.startValue === 'string' &&
          typeof a.endValue === 'string' &&
          (typeof a.startTime === 'string' || typeof a.startTime === 'number') &&
          (typeof a.endTime === 'string' || typeof a.endTime === 'number')
        ) {
          ampRamp = {
            start: a.startValue,
            end: a.endValue,
            startTime: Number(a.startTime),
            endTime: Number(a.endTime),
          }
        }
        break
      case 'AmpUpdateStopped':
        if (typeof a.currentValue === 'string') snap.ampValue = a.currentValue
        ampRamp = null
        break
    }
  }

  // Resolve amp value at the target timestamp. Three regimes:
  //   1. inside an active ramp (startTime ≤ t < endTime) → linear interp
  //   2. past the ramp (t ≥ endTime) → ramp end value
  //   3. before any ramp (t < startTime) → ramp start value (rare — only if
  //      the cursor lands between an AmpUpdateStarted event and its own
  //      startTime, which can happen when start is scheduled in the future)
  if (ampRamp) {
    if (timestamp >= ampRamp.endTime) {
      snap.ampValue = ampRamp.end
      snap.ampIsRamping = false
    } else if (timestamp <= ampRamp.startTime) {
      snap.ampValue = ampRamp.start
      snap.ampIsRamping = false
    } else {
      const t = (timestamp - ampRamp.startTime) / (ampRamp.endTime - ampRamp.startTime)
      snap.ampValue = lerpBigDecimal(ampRamp.start, ampRamp.end, t)
      snap.ampIsRamping = true
    }
  }

  return snap
}

/** Daily-snapshot bucket. Field set mirrors `PoolPageData['snapshots']`. */
export type MetricSnapshot = {
  timestamp: number
  totalLiquidity: number
  volume24h: number
  fees24h: number
}

/** Linear TVL interpolation between the two snapshot buckets surrounding
 *  `t`. Clamps to the edges outside the series. Mirrors the
 *  `PoolHistoryChart` helper so cursor markers and the compare panel see
 *  the same number on the y-axis. */
export function interpolateTvl(snapshots: readonly MetricSnapshot[], t: number): number {
  if (snapshots.length === 0) return 0
  if (t <= snapshots[0].timestamp) return snapshots[0].totalLiquidity
  const last = snapshots[snapshots.length - 1]
  if (t >= last.timestamp) return last.totalLiquidity
  for (let i = 1; i < snapshots.length; i++) {
    const lo = snapshots[i - 1]
    const hi = snapshots[i]
    if (t >= lo.timestamp && t <= hi.timestamp) {
      const f = (t - lo.timestamp) / Math.max(1, hi.timestamp - lo.timestamp)
      return lo.totalLiquidity + (hi.totalLiquidity - lo.totalLiquidity) * f
    }
  }
  return last.totalLiquidity
}

/** Sum a per-day field over the inclusive `[ta, tb]` window. Snapshots
 *  are daily-bucketed, so this is a coarse total — accurate to within one
 *  bucket at each edge, which is fine at this granularity. */
export function sumWindow(
  snapshots: readonly MetricSnapshot[],
  ta: number,
  tb: number,
  key: 'volume24h' | 'fees24h'
): number {
  const [lo, hi] = ta <= tb ? [ta, tb] : [tb, ta]
  let total = 0
  for (const s of snapshots) {
    if (s.timestamp >= lo && s.timestamp <= hi) total += s[key]
  }
  return total
}

export type ParamChangeKey = keyof ParamSnapshot

export type ParamChange = {
  key: ParamChangeKey
  /** Human-readable label for the panel row. */
  label: string
  /** Short caption hinting what units the value is in. */
  hint: string
  /** Category for color/grouping — reused from `eventStyles.ts`. */
  category: 'fee' | 'amp' | 'state' | 'surge'
  before: ParamSnapshot[ParamChangeKey]
  after: ParamSnapshot[ParamChangeKey]
}

const PARAM_DEFS: ReadonlyArray<{
  key: ParamChangeKey
  label: string
  hint: string
  category: ParamChange['category']
}> = [
  { key: 'swapFeePercentage', label: 'Swap fee', hint: 'static pool swap fee', category: 'fee' },
  {
    key: 'aggregateSwapFeePercentage',
    label: 'Aggregate swap fee',
    hint: 'protocol + creator on swaps',
    category: 'fee',
  },
  {
    key: 'aggregateYieldFeePercentage',
    label: 'Aggregate yield fee',
    hint: 'protocol + creator on yield',
    category: 'fee',
  },
  {
    key: 'poolCreatorSwapFeePercentage',
    label: 'Pool-creator swap',
    hint: 'creator share of swaps',
    category: 'fee',
  },
  {
    key: 'poolCreatorYieldFeePercentage',
    label: 'Pool-creator yield',
    hint: 'creator share of yield',
    category: 'fee',
  },
  {
    key: 'protocolSwapFeePercentage',
    label: 'Protocol swap',
    hint: 'per-pool override',
    category: 'fee',
  },
  {
    key: 'protocolYieldFeePercentage',
    label: 'Protocol yield',
    hint: 'per-pool override',
    category: 'fee',
  },
  {
    key: 'surgeThresholdPercentage',
    label: 'Surge threshold',
    hint: 'imbalance above which surge applies',
    category: 'surge',
  },
  {
    key: 'maxSurgeFeePercentage',
    label: 'Max surge fee',
    hint: 'cap on surge swap fee',
    category: 'surge',
  },
  { key: 'ampValue', label: 'Amp factor', hint: 'curve concentration', category: 'amp' },
  { key: 'paused', label: 'Paused', hint: 'emergency pause', category: 'state' },
  { key: 'recoveryMode', label: 'Recovery mode', hint: 'fee-less exit only', category: 'state' },
]

/** Return only the params that differ between two snapshots. Undefined
 *  values are treated as "unknown" rather than zero, so a param going
 *  from unset → set still surfaces as a change. */
export function diffSnapshots(a: ParamSnapshot, b: ParamSnapshot): ParamChange[] {
  const changes: ParamChange[] = []
  for (const def of PARAM_DEFS) {
    const before = a[def.key]
    const after = b[def.key]
    // Treat "both undefined" as no change. Treat "different" as a change,
    // including unset → set transitions (genuinely informative).
    if (before === undefined && after === undefined) continue
    if (before === after) continue
    changes.push({ ...def, before, after })
  }
  return changes
}

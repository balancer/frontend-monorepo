/**
 * Historical AutoRange bounds — archive `eth_call` per snapshot timestamp.
 *
 * The headline visualization need is "how have min/max moved over the last
 * 30/90/180 days?". The contract only exposes *current* state, so we
 * sample it as-of historical blocks. For each requested timestamp we:
 *
 *  1. Estimate a block number from per-chain block-time constants and a
 *     single up-front `latest` lookup. Estimate-only (no binary search) —
 *     a few-minute error in block selection doesn't visibly affect a
 *     daily-cadence bounds chart, and binary-searching every sample would
 *     burn ~`log2(latest)` RPC calls each.
 *  2. Archive-multicall the AutoRange state at that block (price range,
 *     virtual balances, live balances, centeredness margin) — one
 *     multicall per sample, 4 reads each.
 *
 * Returned points are pre-computed: the reader derives spot, low/high
 * target prices, and centeredness so the client doesn't replicate the
 * math. Failures per-sample degrade gracefully — a single point with
 * `minPrice: NaN` means the archive call failed for that block but the
 * series still renders.
 */

import 'server-only'
import {
  type Abi,
  type Address,
  type ContractFunctionParameters,
  parseAbi,
} from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainLimit, getPublicClient } from '@analytics/lib/drpc/client'
import { secondsPerBlock } from '@analytics/lib/networks/chain-info'

// Re-declared ABI subset — only the four reads we need at historical
// blocks. Keeping it local avoids a circular dep with `read.ts` (which
// owns the live-state version of the same ABI) and the parsed bytes are
// trivial bundle weight.
const RECLAMM_HISTORY_ABI = parseAbi([
  'function computeCurrentPriceRange() view returns (uint256 minPrice, uint256 maxPrice)',
  'function computeCurrentVirtualBalances() view returns (uint256 virtualBalanceA, uint256 virtualBalanceB, bool changed)',
  'function getCurrentLiveBalances() view returns (uint256[] balancesLiveScaled18)',
  'function getCenterednessMargin() view returns (uint256)',
]) satisfies Abi

export type AutoRangeHistoryPoint = {
  /** Snapshot timestamp this sample anchors to (unix seconds). */
  timestamp: number
  /** Estimated block number used for the archive read. Surfaced so the
   *  client can show "sampled at block N" if it wants to. */
  blockNumber: number
  /** Min price at that block (1e18-descaled). `NaN` when the archive
   *  read failed for this sample. */
  minPrice: number
  maxPrice: number
  /** Spot price derived from `(liveB + vB) / (liveA + vA)` — matches the
   *  Tier 1 live derivation, so live + historical are visually consistent. */
  spotPrice: number
  /** Lower edge of the green target band. */
  lowTargetPrice: number
  /** Upper edge of the green target band. */
  highTargetPrice: number
  /** Centeredness in [0,1] — 1 means perfectly centered, 0 means one
   *  side fully drained. Compare against `centerednessMarginPct` to
   *  decide whether the pool was "in target range" at that block. */
  centeredness: number
  /** True when the sample's spot price sits between the green band's
   *  low/high targets (i.e. swaps earn target fees, no recenter pressure). */
  inTargetRange: boolean
}

const ZERO = 0n

// ── AutoRange math (same as PoolStatePanel's inline helpers) ──────────
// Duplicated here so the server reader is self-contained and we don't
// have to thread a cross-package import for two short pure functions.
function lowerMarginBalance(marginPct: number, invariant: number, vA: number, vB: number) {
  const m = marginPct / 100
  const b = vA + m * vA
  const c = m * (vA * vA - (invariant * vA) / vB)
  return vA + (-b + Math.sqrt(b * b - 4 * c)) / 2
}
function upperMarginBalance(marginPct: number, invariant: number, vA: number, vB: number) {
  const m = marginPct / 100
  const b = (vA + m * vA) / m
  const c = (vA * vA - (vA * invariant) / vB) / m
  return vA + (-b + Math.sqrt(b * b - 4 * c)) / 2
}

/** Centeredness in [0,1]. Matches `computeCenteredness` from frontend-v3's
 *  reclAmmMath — the result is `min(num, den) / max(num, den)` where
 *  num = balanceA * vB, den = balanceB * vA. */
function computeCenteredness(liveA: number, liveB: number, vA: number, vB: number): number {
  if (liveA === 0 || liveB === 0) return 0
  const num = liveA * vB
  const den = liveB * vA
  if (num === 0 || den === 0) return 0
  return num < den ? num / den : den / num
}

/**
 * Estimate the block number active at the given target timestamp.
 *
 * Linear interpolation off the chain's average block time + the latest
 * known `(block, ts)` anchor. Clamped to non-negative; the historical
 * scan is downstream-responsible for handling pre-deployment samples
 * (the archive call simply returns zeros / reverts and we mark NaN).
 */
function estimateBlockAtTs(
  chain: GqlChain,
  latestBlock: bigint,
  latestTs: number,
  targetTs: number
): bigint {
  const spb = secondsPerBlock(chain)
  const dt = latestTs - targetTs
  if (dt <= 0) return latestBlock
  const blocksBack = BigInt(Math.round(dt / spb))
  const candidate = latestBlock - blocksBack
  return candidate < ZERO ? ZERO : candidate
}

/**
 * Sample AutoRange historical state at each `snapshotTimestamps`. One
 * archive multicall per sample, fanned out with the existing per-chain
 * concurrency gate so we don't blow past drpc's per-second budget on
 * wide ranges. Each sample is independent — failures slot in as NaN
 * points rather than aborting the whole series.
 */
export async function readAutoRangeHistory(
  chain: GqlChain,
  poolAddress: Address,
  snapshotTimestamps: readonly number[]
): Promise<AutoRangeHistoryPoint[]> {
  if (snapshotTimestamps.length === 0) return []

  const client = getPublicClient(chain)
  const limit = getChainLimit(chain)

  // Single up-front `latest` lookup anchors the block-time estimate. We
  // intentionally pay the round-trip even when the page already has the
  // current block from elsewhere — the reader needs to stay self-contained
  // for the API route to call it cleanly.
  const latest = await client.getBlock({ blockTag: 'latest' })
  const latestBlock = latest.number
  const latestTs = Number(latest.timestamp)

  const samples = await Promise.all(
    snapshotTimestamps.map(ts =>
      limit(async (): Promise<AutoRangeHistoryPoint> => {
        const blockNumber = estimateBlockAtTs(chain, latestBlock, latestTs, ts)

        // Sample-level NaN result — used both for the "before deployment"
        // case (estimated block < 0 clamped to 0) and for archive read
        // failures. Keeps the time series shape stable for downstream
        // chart code.
        const empty: AutoRangeHistoryPoint = {
          timestamp: ts,
          blockNumber: Number(blockNumber),
          minPrice: NaN,
          maxPrice: NaN,
          spotPrice: NaN,
          lowTargetPrice: NaN,
          highTargetPrice: NaN,
          centeredness: NaN,
          inTargetRange: false,
        }

        if (blockNumber === ZERO) return empty

        const calls: ContractFunctionParameters[] = [
          {
            address: poolAddress,
            abi: RECLAMM_HISTORY_ABI,
            functionName: 'computeCurrentPriceRange',
          },
          {
            address: poolAddress,
            abi: RECLAMM_HISTORY_ABI,
            functionName: 'computeCurrentVirtualBalances',
          },
          {
            address: poolAddress,
            abi: RECLAMM_HISTORY_ABI,
            functionName: 'getCurrentLiveBalances',
          },
          {
            address: poolAddress,
            abi: RECLAMM_HISTORY_ABI,
            functionName: 'getCenterednessMargin',
          },
        ]

        // Archive RPCs can fail wholesale (chain pruned this block; drpc
        // tier doesn't cover archive). In that case `.catch` returns null
        // and we surface a NaN sample so the time series shape stays
        // stable. Inline `await` so viem's generic return type infers
        // cleanly — a pre-declared `Awaited<ReturnType<...>>` collapses
        // to `unknown`.
        const results = await client
          .multicall({ contracts: calls, allowFailure: true, blockNumber })
          .catch(() => null)
        if (!results || results[0].status !== 'success') return empty
        const [minRaw, maxRaw] = results[0].result as readonly [bigint, bigint]
        const vb = results[1].status === 'success'
          ? (results[1].result as readonly [bigint, bigint, boolean])
          : null
        const lb = results[2].status === 'success'
          ? (results[2].result as readonly bigint[])
          : null
        const marginRaw =
          results[3].status === 'success' ? (results[3].result as bigint) : null

        if (!vb || !lb || lb.length < 2 || marginRaw === null) {
          // Insufficient supporting data to compute derived values — surface
          // the bounds we did get and leave the rest NaN.
          return {
            ...empty,
            minPrice: Number(minRaw) / 1e18,
            maxPrice: Number(maxRaw) / 1e18,
          }
        }

        const vA = Number(vb[0]) / 1e18
        const vBval = Number(vb[1]) / 1e18
        const liveA = Number(lb[0]) / 1e18
        const liveB = Number(lb[1]) / 1e18
        const marginPct = Number(marginRaw) / 1e16

        const totalA = liveA + vA
        const totalB = liveB + vBval
        const spotPrice = totalA > 0 ? totalB / totalA : NaN

        const invariant = totalA * totalB
        const lowerBal = lowerMarginBalance(marginPct, invariant, vA, vBval)
        const upperBal = upperMarginBalance(marginPct, invariant, vA, vBval)
        const highTargetPrice = Number.isFinite(lowerBal)
          ? invariant / (lowerBal * lowerBal)
          : NaN
        const lowTargetPrice = Number.isFinite(upperBal)
          ? invariant / (upperBal * upperBal)
          : NaN

        const centeredness = computeCenteredness(liveA, liveB, vA, vBval)
        const inTargetRange =
          Number.isFinite(spotPrice) &&
          Number.isFinite(lowTargetPrice) &&
          Number.isFinite(highTargetPrice) &&
          spotPrice >= lowTargetPrice &&
          spotPrice <= highTargetPrice

        return {
          timestamp: ts,
          blockNumber: Number(blockNumber),
          minPrice: Number(minRaw) / 1e18,
          maxPrice: Number(maxRaw) / 1e18,
          spotPrice,
          lowTargetPrice,
          highTargetPrice,
          centeredness,
          inTargetRange,
        }
      })
    )
  )

  // Ordered ascending — snapshot input could come in any order; the chart
  // wants oldest-first on the x-axis.
  return samples.sort((a, b) => a.timestamp - b.timestamp)
}

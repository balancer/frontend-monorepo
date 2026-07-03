/**
 * Chunked `eth_getLogs` walker with auto-shrink retry and bounded parallelism.
 *
 * drpc's per-call block range limit varies by chain: ~10k blocks unfiltered,
 * up to ~100k with an indexed-topic filter. We start at 50k for safety.
 *
 * Two layers of fault tolerance:
 *   1. Bounded parallelism via `p-limit` — chunks are dispatched
 *      concurrently up to a per-call cap (default 4). This is the main
 *      reason cold scans finish in seconds rather than minutes.
 *   2. Per-range halve-and-retry — when a single chunk hits a range / size
 *      / timeout error, we split it in half and recurse rather than
 *      failing the whole walk. Bottom of the recursion is `MIN_CHUNK_SIZE`
 *      blocks; anything smaller propagates the error.
 *
 * Timeouts are treated as range errors. drpc occasionally takes longer
 * than viem's transport timeout on wide topic filters; shrinking the
 * range usually finishes well inside the budget.
 */

import 'server-only'
import pLimit from 'p-limit'
import type { Log, PublicClient } from 'viem'
import { scrubSecret } from './scrub'

const DEFAULT_CHUNK_SIZE = 50_000n
const MIN_CHUNK_SIZE = 1_000n
const DEFAULT_CONCURRENCY = 4

// Errors where shrinking the block range is the right response: the
// underlying query was too big and a smaller window will fit.
const RANGE_ERROR_PATTERNS = [
  /block range/i,
  /range too large/i,
  /exceed maximum/i,
  /more than .* results/i,
  /response size exceeded/i,
]

// Errors that are likely to clear if we just try again — drpc's "code 19"
// internal error and timeouts/5xx that aren't size-related. We bounded-
// retry these in-place before falling back to range-splitting.
const TRANSIENT_ERROR_PATTERNS = [
  /temporary internal/i,
  /internal error/i,
  /rate ?limit/i,
  /too many requests/i,
  /bad gateway/i,
  /service unavailable/i,
  /timed? ?out/i,
  /timeout/i,
]

function errorBlob(err: unknown): { msg: string; status?: number; causeName?: string } {
  const e = err as {
    message?: string
    shortMessage?: string
    status?: number
    cause?: { name?: string }
  }
  return {
    msg: `${e?.shortMessage ?? ''} ${e?.message ?? ''} ${e?.cause?.name ?? ''}`,
    status: e?.status,
    causeName: e?.cause?.name,
  }
}

/**
 * viem's `HttpRequestError` keeps the full request URL — including the
 * embedded drpc API key — on both `err.url` and the (already-serialized)
 * `err.message`. We don't trust every caller to remember to run errors
 * through `scrubError()` before logging, so we scrub at the throw site
 * here as defense-in-depth: any error that escapes `chunkedGetLogs` is
 * already secret-free.
 */
function scrubAndThrow(err: unknown): never {
  const e = err as {
    name?: string
    message?: string
    shortMessage?: string
    url?: string
    status?: number
  }
  if (e?.message) e.message = scrubSecret(e.message) as string
  if (e?.shortMessage) e.shortMessage = scrubSecret(e.shortMessage) as string
  if (e?.url) e.url = scrubSecret(e.url) as string
  throw err
}

function isRangeError(err: unknown): boolean {
  const { msg } = errorBlob(err)
  return RANGE_ERROR_PATTERNS.some(p => p.test(msg))
}

function isTransientError(err: unknown): boolean {
  const { msg, status, causeName } = errorBlob(err)
  if (status && status >= 500 && status !== 501) return true
  if (status === 429) return true
  if (causeName === 'TimeoutError') return true
  return TRANSIENT_ERROR_PATTERNS.some(p => p.test(msg))
}

export type ChunkedGetLogsParams = {
  fromBlock: bigint
  toBlock: bigint
  chunkSize?: bigint
  /** Max concurrent in-flight chunks. Default 4. */
  concurrency?: number
  // The remaining fields mirror viem's `getLogs` parameter shape but are
  // loose-typed to avoid fighting the discriminated-union overload — the
  // values are forwarded to viem unchanged.
  address?: unknown
  event?: unknown
  events?: unknown
  args?: unknown
  strict?: boolean
}

export type DecodedLog = Log<bigint, number, false> & {
  eventName?: string
  args?: Record<string, unknown> | readonly unknown[]
}

export async function chunkedGetLogs(
  client: PublicClient,
  params: ChunkedGetLogsParams
): Promise<DecodedLog[]> {
  const { fromBlock, toBlock, chunkSize, concurrency, ...rest } = params
  if (toBlock < fromBlock) return []

  const initialStride = chunkSize ?? DEFAULT_CHUNK_SIZE
  const limit = pLimit(concurrency ?? DEFAULT_CONCURRENCY)

  // Pre-build the list of chunk ranges. Each chunk is handled independently
  // (its own retry-with-split path), so the dispatch order doesn't matter.
  const ranges: Array<{ from: bigint; to: bigint }> = []
  for (let cursor = fromBlock; cursor <= toBlock; cursor += initialStride) {
    const end = cursor + initialStride - 1n < toBlock ? cursor + initialStride - 1n : toBlock
    ranges.push({ from: cursor, to: end })
  }

  const TRANSIENT_RETRY_DELAYS = [300, 800, 2000] // ms — exponential-ish

  async function fetchRange(from: bigint, to: bigint): Promise<DecodedLog[]> {
    // Try the request, retry transient failures in place, fall back to
    // range-splitting for genuine "too big" errors. The retry loop bails
    // out as soon as we get a non-transient response (success or hard
    // failure), keeping the wall-clock cost reasonable.
    let lastErr: unknown
    for (let attempt = 0; attempt <= TRANSIENT_RETRY_DELAYS.length; attempt++) {
      try {
        const logs = (await (client.getLogs as (p: unknown) => Promise<unknown>)({
          ...rest,
          fromBlock: from,
          toBlock: to,
        })) as DecodedLog[]
        return logs
      } catch (err) {
        lastErr = err
        const span = to - from + 1n

        // Range-too-large — split immediately, no retry. A smaller window
        // is fundamentally what drpc needs here, not patience.
        if (isRangeError(err) && span > MIN_CHUNK_SIZE) {
          const mid = from + span / 2n - 1n
          const left = await fetchRange(from, mid)
          const right = await fetchRange(mid + 1n, to)
          return [...left, ...right]
        }

        // Transient — wait then retry the same range, up to N attempts.
        if (isTransientError(err) && attempt < TRANSIENT_RETRY_DELAYS.length) {
          await new Promise(resolve => setTimeout(resolve, TRANSIENT_RETRY_DELAYS[attempt]))
          continue
        }

        // After exhausting transient retries, try one last range split as
        // a heuristic — a smaller request sometimes succeeds where a
        // bigger one repeatedly fails on flaky chains.
        if (span > MIN_CHUNK_SIZE) {
          const mid = from + span / 2n - 1n
          const left = await fetchRange(from, mid)
          const right = await fetchRange(mid + 1n, to)
          return [...left, ...right]
        }

        scrubAndThrow(err)
      }
    }
    scrubAndThrow(lastErr)
  }

  // Fan out — p-limit gates how many chunks are in flight at once.
  const groups = await Promise.all(ranges.map(r => limit(() => fetchRange(r.from, r.to))))
  return groups.flat()
}

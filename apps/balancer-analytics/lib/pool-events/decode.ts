/**
 * Decode viem `Log` results into JSON-safe `PoolParamEventRow`s suitable for
 * `insertPoolParamEvents`.
 *
 * viem's `getLogs({ events })` returns logs with `eventName` set and `args`
 * already-typed by event. We do three things on top:
 *
 *   1. Serialize args to a JSON-safe shape — BigInts become decimal strings
 *      (Postgres BIGINT can hold uint64 but Solidity uint256 overflows JS
 *      Number and JSONB; the inspector layer parses back as needed).
 *   2. Stamp `block_timestamp` from a `blockNumber → ts` map resolved once
 *      per sync (see `lib/drpc/block-timestamps.ts`).
 *   3. Filter out any logs that slipped through with unexpected shapes
 *      (e.g. an anonymous event matching the topic by coincidence — viem
 *      typically returns these with `eventName: undefined`).
 *
 * No event-name allowlist here: callers control the event set via the
 * `events` argument to `getLogs`, so anything that lands here is a tracked
 * event. The decoder stays type-agnostic across event names — adding a new
 * event requires only an addition to `event-signatures.ts`.
 */

import type { Log } from 'viem'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { PoolParamEventRow } from '@analytics/lib/db'

type DecodedLog = Log<bigint, number, false> & {
  eventName?: string
  args?: Record<string, unknown> | readonly unknown[]
}

export type DecodeContext = {
  chain: GqlChain
  poolAddress: string
  protocolVersion: 1 | 2 | 3
  /** Map populated by `resolveBlockTimestamps` — unique blocks → unix seconds. */
  blockTimestamps: ReadonlyMap<bigint, number>
}

/**
 * Recursively serialize an arg value to a JSON-safe form. Handles BigInts,
 * arrays, and plain objects; passes strings / numbers / bools / null
 * through unchanged.
 */
function toJsonSafe(value: unknown): unknown {
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map(toJsonSafe)
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toJsonSafe(v)
    }
    return out
  }
  return value
}

function normalizeArgs(args: DecodedLog['args']): Record<string, string | number | boolean> {
  if (!args) return {}
  // viem returns named args as a Record when the ABI item has named params;
  // positional args land in an array. Our parseAbi signatures always name
  // everything, so the Record branch is the common case.
  if (Array.isArray(args)) {
    const out: Record<string, string | number | boolean> = {}
    args.forEach((v, i) => {
      const safe = toJsonSafe(v)
      out[`arg${i}`] = safe as string | number | boolean
    })
    return out
  }
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(args)) {
    const safe = toJsonSafe(v)
    // Skip indexed `pool` echo — the row is already keyed on pool_address,
    // duplicating it in args wastes bytes and confuses inspectors.
    if (k === 'pool') continue
    out[k] = safe as string | number | boolean
  }
  return out
}

export function decodeLogsToRows(
  logs: readonly DecodedLog[],
  ctx: DecodeContext
): PoolParamEventRow[] {
  const rows: PoolParamEventRow[] = []
  for (const log of logs) {
    if (!log.eventName) continue
    if (log.blockNumber === null || log.logIndex === null || log.transactionHash === null) {
      continue
    }
    const ts = ctx.blockTimestamps.get(log.blockNumber)
    if (ts === undefined) {
      // Unresolved timestamp — skip rather than insert a row with a
      // garbage value. The sync resolves every block we got a log for, so
      // a miss here indicates a real bug worth surfacing in logs.
      console.warn('[decode] missing block timestamp', {
        block: log.blockNumber.toString(),
        event: log.eventName,
      })
      continue
    }
    rows.push({
      chain: ctx.chain,
      poolAddress: ctx.poolAddress.toLowerCase(),
      protocolVersion: ctx.protocolVersion,
      blockNumber: Number(log.blockNumber),
      blockTimestamp: ts,
      logIndex: log.logIndex,
      txHash: log.transactionHash,
      eventName: log.eventName,
      args: normalizeArgs(log.args),
    })
  }
  return rows
}

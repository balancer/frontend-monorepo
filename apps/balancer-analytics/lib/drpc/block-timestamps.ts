/**
 * Resolve `block_number → block_timestamp` for a set of unique blocks.
 *
 * `eth_getLogs` returns block numbers but not timestamps. The pool param
 * timeline needs timestamps for the chart's x-axis, so we batch-fetch
 * `eth_getBlockByNumber` once per unique block in a sync. Within a single
 * sync we dedupe via the input `Set<bigint>` — events sharing a block
 * (e.g. a governance batch updating fees on N pools) cost one RPC call,
 * not N.
 *
 * No persistent cache: each event's resolved timestamp is written into
 * `pool_param_events.block_timestamp` on INSERT, so subsequent syncs never
 * re-fetch it. Cross-pool block overlap is rare enough that the marginal
 * RPC saving isn't worth a separate cache table.
 */

import 'server-only'
import type { PublicClient } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getChainLimit } from './client'

export async function resolveBlockTimestamps(
  client: PublicClient,
  chain: GqlChain,
  blocks: Iterable<bigint>
): Promise<Map<bigint, number>> {
  const unique = Array.from(new Set(blocks))
  if (unique.length === 0) return new Map()
  const limit = getChainLimit(chain)

  const results = await Promise.all(
    unique.map(blockNumber =>
      limit(async () => {
        const block = await client.getBlock({ blockNumber })
        return [blockNumber, Number(block.timestamp)] as const
      })
    )
  )
  return new Map(results)
}

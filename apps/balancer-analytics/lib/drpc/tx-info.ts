/**
 * Lazy `tx.to` lookup via drpc. Used by the PoolOrderFlow route to map a
 * swap event's tx hash to the outermost contract called in that tx — the
 * actual entry point (1inch Router, CoW Settlement, Balancer Router, MEV
 * bot contract, …). api-v3's `sender` field is the tx originator EOA,
 * which is mostly unlabelable; `tx.to` is the right signal for "who
 * routed this trade?".
 *
 * Soft-fails: a chain without a configured drpc endpoint, or a request
 * timeout, returns an empty map. The route then falls back to the
 * EOA-keyed sender lookup, which still catches Dune-listed MEV searcher
 * EOAs but misses aggregator-routed flow.
 */

import 'server-only'
import pLimit from 'p-limit'
import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  getChainLimit,
  getPublicClient,
  UnsupportedChainError,
} from './client'
import { scrubSecret } from './scrub'

/** Concurrent in-flight `eth_getTransactionByHash` requests per route hit.
 *  Tuned against drpc's per-IP rate-limit (typical: ~50 RPS on the free tier);
 *  the per-chain p-limit gate caps this further. Bigger batches do not help
 *  here — eth_getTransactionByHash is a per-tx RPC, not range-walkable. */
const PER_REQUEST_CONCURRENCY = 12

export type TxToMap = Map<string, string | null>

/**
 * Fetch `tx.to` for up to N tx hashes in parallel. Returned map is keyed
 * by lowercased tx hash; missing tx hashes (drpc returned null) and
 * lookup failures both get a `null` value so the caller can treat them
 * as "we tried, write a negative cache row, don't retry".
 */
export async function fetchTxToAddresses(
  chain: GqlChain,
  txHashes: readonly string[]
): Promise<TxToMap> {
  const out: TxToMap = new Map()
  if (txHashes.length === 0) return out

  let client
  try {
    client = getPublicClient(chain)
  } catch (err) {
    if (err instanceof UnsupportedChainError) {
      console.info(`[drpc/tx-info] no drpc endpoint for ${chain} — skipping enrichment`)
      return out
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.warn('[drpc/tx-info] failed to acquire client:', scrubSecret(msg))
    return out
  }

  // Dedupe + lowercase. We always seed the output with a `null` row for
  // every input hash so callers see a record (positive or negative) for
  // each — that's what stops the same hash from being re-enriched on
  // every subsequent visit.
  const normalized = Array.from(new Set(txHashes.map(h => h.toLowerCase())))
  for (const h of normalized) out.set(h, null)

  const chainGate = getChainLimit(chain)
  const localGate = pLimit(PER_REQUEST_CONCURRENCY)

  await Promise.all(
    normalized.map(hash =>
      chainGate(() =>
        localGate(async () => {
          try {
            const tx = await client.getTransaction({ hash: hash as `0x${string}` })
            if (tx?.to) out.set(hash, tx.to.toLowerCase())
          } catch (err) {
            // viem throws if the tx isn't found, the node times out, etc.
            // We keep the seeded null — better to write "we tried" than to
            // retry on the next visit. Log scrubbed for safety (drpc URLs
            // can contain the API key on viem errors).
            const msg = err instanceof Error ? err.message : String(err)
            console.warn(
              `[drpc/tx-info] tx ${hash.slice(0, 10)}…: ${scrubSecret(msg)}`
            )
          }
        })
      )
    )
  )

  return out
}

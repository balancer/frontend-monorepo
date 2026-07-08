import type { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import type { SourceCategory, SourceLabel } from '../types'
import { DIRECT_LABELS } from './direct'

/** CowAmm-pool swaps are routed exclusively through CowSwap, so the
 *  typename alone is enough to classify them — no address lookup needed. */
const COWSWAP_INTENT: SourceLabel = {
  id: 'cowswap',
  name: 'CowSwap',
  category: 'intent',
}

/** Terminal fallback. Every swap that misses every other tier lands here.
 *  The "Unknown" Sankey node functions as the curation backlog — its top
 *  contributors are the next addresses to label. */
const UNKNOWN: SourceLabel = {
  id: 'unknown',
  name: 'Unknown',
  category: 'unknown',
}

export { COWSWAP_INTENT, UNKNOWN }

/** Per-tx outermost-callee cache, keyed by lowercased tx hash.
 *  `null` means "we looked, nothing useful" (drpc returned no `to`).
 *  Absence (key not in map) means "we haven't enriched this tx yet". */
export type TxToCache = ReadonlyMap<string, string | null>

/** Dune-sourced labels, keyed by lowercased address. Populated by the
 *  route from the `dune_address_labels` table; absent on cold caches if
 *  the weekly cron hasn't run yet. */
export type DuneLabelCache = ReadonlyMap<
  string,
  { sourceId: string; name: string; category: string }
>

/** Translate a Dune-cached row into a SourceLabel. Done at lookup time
 *  so we don't store widened category strings in the dictionary types. */
function duneToSourceLabel(d: { sourceId: string; name: string; category: string }): SourceLabel {
  return {
    id: d.sourceId,
    name: d.name,
    category: d.category as SourceCategory,
  }
}

/**
 * Resolve a swap to a {@link SourceLabel}.
 *
 * Cascade — earlier tiers win, so curated manual labels always override
 * the bulk-imported Dune dictionary:
 *   1. **CowAmm typename**: CowAmm pools are by definition CowSwap-mediated.
 *   2. **Static dict on tx.to** (manual curation): aggregator/MEV/router
 *      contracts we've hand-labeled in `direct.ts`.
 *   3. **Dune dict on tx.to**: ~7k labels imported weekly from Dune
 *      query 3004790. Fills the long tail of named routers and DEX
 *      aggregator contracts manual curation misses.
 *   4. **Static dict on sender**: catches Dune-listed MEV searcher EOAs
 *      via the original Dune CSV we shipped.
 *   5. **Dune dict on sender**: same intent but for the broader Dune
 *      label set.
 *   6. **Unknown**.
 *
 * Empirical note: api-v3's `sender` field is the tx originator EOA
 * (`tx.from`), not the Vault caller — so `tx.to` is the high-value
 * signal. The sender fallback exists to catch the rare cases where
 * the EOA itself is in the dictionary (MEV searchers, named bots).
 */
export function labelSwapSource(
  swap: { __typename?: string; sender: string; tx: string },
  chain: GqlChain,
  caches: { txTo: TxToCache; dune: DuneLabelCache }
): SourceLabel {
  if (swap.__typename === 'GqlPoolSwapEventCowAmm') return COWSWAP_INTENT

  const directDict = DIRECT_LABELS[chain] ?? {}

  // Tier 2-3: tx.to — the actual entry contract.
  const txTo = caches.txTo.get(swap.tx.toLowerCase())
  if (txTo) {
    const direct = directDict[txTo]
    if (direct) return direct
    const dune = caches.dune.get(txTo)
    if (dune) return duneToSourceLabel(dune)
  }

  // Tier 4-5: sender (the EOA / tx originator). Catches Dune-listed
  // searcher EOAs even when tx.to isn't cached yet.
  const sender = swap.sender.toLowerCase()
  const senderStatic = directDict[sender]
  if (senderStatic) return senderStatic
  const senderDune = caches.dune.get(sender)
  if (senderDune) return duneToSourceLabel(senderDune)

  return UNKNOWN
}

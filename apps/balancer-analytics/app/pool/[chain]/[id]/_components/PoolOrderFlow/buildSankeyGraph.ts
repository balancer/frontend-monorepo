/**
 * Pure aggregator: turns labeled swaps into an ECharts-Sankey-shaped graph.
 *
 * The graph has three columns:
 *
 *   depth 0  ─ source      (1inch, cowswap, mev_bot, balancer, unknown, …)
 *   depth 1  ─ token in    (one node per token address)
 *   depth 2  ─ token out   (one node per token address)
 *
 * Link width is USD volume. Token nodes are namespaced by column (`tin:` vs
 * `tout:`) so ECharts can keep the same token address on both sides of the
 * diagram without collapsing them into a single node.
 *
 * Two scope-control knobs:
 *   - `minUsd`            — drops dust swaps before aggregation.
 *   - `otherThresholdPct` — rolls up small *labeled* sources into a synthetic
 *                           "Other" node so the diagram stays legible.
 *                           Genuinely-unknown swaps are NOT rolled up; they
 *                           keep their own node because the size of that
 *                           node is the curation backlog signal.
 */

import type { LabeledSwap, SourceCategory, SourceLabel } from './types'

// ── Public types ───────────────────────────────────────────────────────────

export type SankeyNodeKind = 'source' | 'tokenIn' | 'tokenOut'

export type SankeyNode = {
  /** Unique name used by ECharts to wire up links. Prefixed by column. */
  name: string
  /** 0 = source, 1 = token in, 2 = token out. Pinning depth keeps the
   *  layout stable even when one column has only a single node. */
  depth: 0 | 1 | 2
  kind: SankeyNodeKind
  /** Source nodes only — null for token nodes. */
  source: SourceLabel | null
  /** Token nodes only — lowercased address. Null for source nodes. */
  tokenAddress: string | null
  /** Sum of swaps flowing through this node, in USD. */
  valueUsd: number
  /** Count of distinct swaps contributing to this node. */
  swapCount: number
}

export type SankeyLink = {
  /** Originating node `name` (matches a SankeyNode.name). */
  source: string
  /** Destination node `name`. */
  target: string
  /** USD flow. ECharts uses this as the link width. */
  value: number
  /** Category of the originating source — used by the renderer to color
   *  the whole link by where it came from, even on the token→token leg. */
  sourceCategory: SourceCategory
  /** Number of swaps making up this link. Useful for tooltips. */
  swapCount: number
}

export type SankeyGraph = {
  nodes: SankeyNode[]
  links: SankeyLink[]
  totals: { volumeUsd: number; swapCount: number }
  /** Per-category USD totals and 0..1 share. Always contains every
   *  `SourceCategory` key (zero-valued if absent) so the legend can render
   *  a stable column layout. */
  categoryShare: Record<SourceCategory, { usd: number; pct: number }>
  /** Unknown-category senders that crossed the split threshold and got
   *  their own `src:unknown:<addr>` node. Exposed so the details drawer
   *  can resolve which raw swaps belong to which source node when the
   *  user clicks. Lowercased addresses. */
  splitUnknownSenders: ReadonlySet<string>
  /** Labeled source ids that were rolled up into the synthetic "Other"
   *  node because their share was below `otherThresholdPct`. Used by the
   *  details drawer for the same "which swaps belong here?" resolution. */
  rolledUpSourceIds: ReadonlySet<string>
}

export type BuildOptions = {
  /** Skip swaps below this USD threshold. Default 0 (include all). */
  minUsd?: number
  /** A labeled source whose total share is below this fraction (0..1)
   *  gets folded into a synthetic "Other" source node. Default 0.005
   *  (0.5%). Set to 0 to disable rollup entirely. */
  otherThresholdPct?: number
  /** Unknown-category swaps whose *per-sender* USD total reaches this
   *  threshold get a synthetic source label keyed by the sender address —
   *  so a single big unknown contributor becomes its own Sankey node
   *  instead of dissolving into the catch-all "Unknown" bucket. This is
   *  the curation backlog signal in chart form. Default $10,000.
   *  Set to 0 to disable splitting. */
  unknownSplitThresholdUsd?: number
  /** Hard cap on how many unknown senders get split into their own node,
   *  even if more exceed `unknownSplitThresholdUsd`. Keeps the diagram
   *  legible — the long tail still rolls up into "Unknown". Default 15. */
  unknownSplitMaxCount?: number
}

// ── Internals ──────────────────────────────────────────────────────────────

const OTHER_LABEL: SourceLabel = {
  id: 'other',
  name: 'Other',
  category: 'unknown',
}

const SOURCE_PREFIX = 'src:'
const TIN_PREFIX = 'tin:'
const TOUT_PREFIX = 'tout:'

function sourceNodeName(id: string): string {
  return `${SOURCE_PREFIX}${id}`
}
function tokenInNodeName(addr: string): string {
  return `${TIN_PREFIX}${addr}`
}
function tokenOutNodeName(addr: string): string {
  return `${TOUT_PREFIX}${addr}`
}

const ALL_CATEGORIES: readonly SourceCategory[] = [
  'aggregator',
  'intent',
  'direct',
  'mev_bot',
  'market_maker',
  'bridge',
  'unknown',
]

/** Stable ordering used for source-node y-position in the Sankey.
 *  Matches the legend order so categories read top-to-bottom in the same
 *  sequence as the legend chips. Index lookup is O(1) via this map. */
const CATEGORY_RANK: Record<SourceCategory, number> = ALL_CATEGORIES.reduce(
  (acc, cat, i) => {
    acc[cat] = i
    return acc
  },
  {} as Record<SourceCategory, number>
)

function emptyCategoryShare(): Record<SourceCategory, { usd: number; pct: number }> {
  const out = {} as Record<SourceCategory, { usd: number; pct: number }>
  for (const c of ALL_CATEGORIES) out[c] = { usd: 0, pct: 0 }
  return out
}

// ── Builder ────────────────────────────────────────────────────────────────

export function buildSankeyGraph(
  swaps: readonly LabeledSwap[],
  opts: BuildOptions = {}
): SankeyGraph {
  const minUsd = opts.minUsd ?? 0
  const otherThresholdPct = opts.otherThresholdPct ?? 0.005
  const unknownSplitThresholdUsd = opts.unknownSplitThresholdUsd ?? 10000
  const unknownSplitMaxCount = opts.unknownSplitMaxCount ?? 15

  // ── First pass: filter, total, per-unknown-sender USD aggregation ────
  // We tally unknowns by sender here so we can decide which ones to split
  // into their own Sankey node before the main grouping loop runs.
  const eligible: LabeledSwap[] = []
  let volumeUsd = 0
  const usdByUnknownSender = new Map<string, number>()
  for (const s of swaps) {
    if (!Number.isFinite(s.valueUSD) || s.valueUSD < minUsd) continue
    if (!s.tokenIn?.address || !s.tokenOut?.address) continue
    eligible.push(s)
    volumeUsd += s.valueUSD
    if (s.source.category === 'unknown' && unknownSplitThresholdUsd > 0) {
      const sender = s.sender.toLowerCase()
      usdByUnknownSender.set(sender, (usdByUnknownSender.get(sender) ?? 0) + s.valueUSD)
    }
  }

  if (eligible.length === 0 || volumeUsd === 0) {
    return {
      nodes: [],
      links: [],
      totals: { volumeUsd: 0, swapCount: 0 },
      categoryShare: emptyCategoryShare(),
      splitUnknownSenders: new Set(),
      rolledUpSourceIds: new Set(),
    }
  }

  // ── Pick the unknown senders that get their own node ──────────────────
  // Above threshold AND top-N by USD. The top-N cap keeps the diagram
  // readable on pools with hundreds of unique unknown contributors —
  // showing 15 named offenders is more actionable than 200.
  const splitUnknownSenders = new Set<string>(
    [...usdByUnknownSender.entries()]
      .filter(([, usd]) => usd >= unknownSplitThresholdUsd)
      .sort((a, b) => b[1] - a[1])
      .slice(0, unknownSplitMaxCount)
      .map(([sender]) => sender)
  )

  /** Apply the unknown-split re-labeling to a single swap. Non-unknown
   *  swaps pass through unchanged. Splits get `id: 'unknown:<address>'`
   *  so the rollup pass can recognize them via the `unknown` prefix. */
  function resolveSource(swap: LabeledSwap): SourceLabel {
    if (swap.source.category !== 'unknown') return swap.source
    const sender = swap.sender.toLowerCase()
    if (!splitUnknownSenders.has(sender)) return swap.source
    return {
      id: `unknown:${sender}`,
      name: sender,
      category: 'unknown',
    }
  }

  // ── Second pass: per-source totals (post-split) for rollup decision ──
  const usdBySourceId = new Map<string, number>()
  for (const s of eligible) {
    const src = resolveSource(s)
    usdBySourceId.set(src.id, (usdBySourceId.get(src.id) ?? 0) + s.valueUSD)
  }

  // ── Decide which source ids get rolled up into "Other" ──
  // Anything under the unknown umbrella ('unknown' and 'unknown:0x...')
  // is never rolled up — those nodes are intentionally visible because
  // they ARE the curation backlog.
  const rolledUp = new Set<string>()
  if (otherThresholdPct > 0) {
    const threshold = volumeUsd * otherThresholdPct
    for (const [sourceId, usd] of usdBySourceId) {
      if (sourceId.startsWith('unknown')) continue
      if (usd < threshold) rolledUp.add(sourceId)
    }
  }
  function effectiveSource(swap: LabeledSwap): SourceLabel {
    const src = resolveSource(swap)
    return rolledUp.has(src.id) ? OTHER_LABEL : src
  }

  // ── Second pass: aggregate links and per-node totals ───────────────────
  // Use compound keys so the maps stay flat — easier to iterate than nested.
  type SourceRow = { source: SourceLabel; usd: number; count: number }
  type TokenRow = { usd: number; count: number }
  type LinkRow = {
    source: string
    target: string
    usd: number
    cat: SourceCategory
    count: number
  }
  const sourceAgg = new Map<string, SourceRow>()
  const tokenInAgg = new Map<string, TokenRow>()
  const tokenOutAgg = new Map<string, TokenRow>()
  const srcToTinLink = new Map<string, LinkRow>()
  const tinToToutLink = new Map<string, LinkRow>()

  for (const s of eligible) {
    const src = effectiveSource(s)
    const tinAddr = s.tokenIn.address.toLowerCase()
    const toutAddr = s.tokenOut.address.toLowerCase()
    if (tinAddr === toutAddr) continue // defensive — non-sensical swap

    // Source node
    let srcRow = sourceAgg.get(src.id)
    if (!srcRow) {
      srcRow = { source: src, usd: 0, count: 0 }
      sourceAgg.set(src.id, srcRow)
    }
    srcRow.usd += s.valueUSD
    srcRow.count += 1

    // Token nodes
    const tinRow = tokenInAgg.get(tinAddr) ?? { usd: 0, count: 0 }
    tinRow.usd += s.valueUSD
    tinRow.count += 1
    tokenInAgg.set(tinAddr, tinRow)

    const toutRow = tokenOutAgg.get(toutAddr) ?? { usd: 0, count: 0 }
    toutRow.usd += s.valueUSD
    toutRow.count += 1
    tokenOutAgg.set(toutAddr, toutRow)

    // Link 1: source → token in
    const srcNodeName = sourceNodeName(src.id)
    const tinNodeName = tokenInNodeName(tinAddr)
    const toutNodeName = tokenOutNodeName(toutAddr)

    const link1Key = `${srcNodeName}->${tinNodeName}`
    const link1 = srcToTinLink.get(link1Key) ?? {
      source: srcNodeName,
      target: tinNodeName,
      usd: 0,
      cat: src.category,
      count: 0,
    }
    link1.usd += s.valueUSD
    link1.count += 1
    srcToTinLink.set(link1Key, link1)

    // Link 2: token in → token out
    // Keyed by source category too — the link inherits the originating source's
    // color so a CowSwap-routed USDC→WETH leg renders distinctly from a
    // 1inch-routed one.
    const link2Key = `${tinNodeName}->${toutNodeName}@${src.category}`
    const link2 = tinToToutLink.get(link2Key) ?? {
      source: tinNodeName,
      target: toutNodeName,
      usd: 0,
      cat: src.category,
      count: 0,
    }
    link2.usd += s.valueUSD
    link2.count += 1
    tinToToutLink.set(link2Key, link2)
  }

  // ── Emit nodes ─────────────────────────────────────────────────────────
  // Sort each column by a range-invariant key so the same node lands at the
  // same y-position regardless of which time window is active. Without this,
  // switching 30d → 7d reshuffles columns because the iteration order of
  // the underlying Maps follows the order swaps were processed.
  //
  // Source column: category rank first (matches the legend's top-to-bottom
  // order), then synthetic "Other" sinks to the bottom of its category, then
  // alphabetical id as the final tiebreaker. The synthetic per-sender
  // `unknown:<addr>` ids sort by address — deterministic across ranges.
  //
  // Token columns: by address. Token symbols are not used because two pools
  // can share a symbol, and we want one stable key.
  const nodes: SankeyNode[] = []
  const sortedSources = [...sourceAgg.values()].sort((a, b) => {
    const rankDiff = CATEGORY_RANK[a.source.category] - CATEGORY_RANK[b.source.category]
    if (rankDiff !== 0) return rankDiff
    const aOther = a.source.id === 'other' ? 1 : 0
    const bOther = b.source.id === 'other' ? 1 : 0
    if (aOther !== bOther) return aOther - bOther
    return a.source.id.localeCompare(b.source.id)
  })
  for (const { source, usd, count } of sortedSources) {
    nodes.push({
      name: sourceNodeName(source.id),
      depth: 0,
      kind: 'source',
      source,
      tokenAddress: null,
      valueUsd: usd,
      swapCount: count,
    })
  }
  const sortedTokenIn = [...tokenInAgg.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [addr, { usd, count }] of sortedTokenIn) {
    nodes.push({
      name: tokenInNodeName(addr),
      depth: 1,
      kind: 'tokenIn',
      source: null,
      tokenAddress: addr,
      valueUsd: usd,
      swapCount: count,
    })
  }
  const sortedTokenOut = [...tokenOutAgg.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  for (const [addr, { usd, count }] of sortedTokenOut) {
    nodes.push({
      name: tokenOutNodeName(addr),
      depth: 2,
      kind: 'tokenOut',
      source: null,
      tokenAddress: addr,
      valueUsd: usd,
      swapCount: count,
    })
  }

  // ── Emit links ─────────────────────────────────────────────────────────
  // Sort by (sourceNodeIndex, targetNodeIndex, sourceCategoryRank). ECharts
  // sankey sorts edges at each node by the other side's y, but the sort is
  // STABLE — when multiple edges share the same target y (which happens on
  // the tokenIn→tokenOut leg, where one source/target pair carries up to
  // one edge per source category), the data-order tiebreaker decides the
  // vertical stacking. Emitting Map iteration order (≈ random) meant the
  // same category color appeared at different vertical positions on each
  // column transition, so a Kyber-coloured band visible at the TOP of the
  // source column could land at the BOTTOM of the receiving stack. Sorting
  // here pins each category to a single vertical lane across all columns.
  const nodeIndex = new Map<string, number>(nodes.map((n, i) => [n.name, i]))
  const links: SankeyLink[] = []
  for (const l of srcToTinLink.values()) {
    links.push({
      source: l.source,
      target: l.target,
      value: l.usd,
      sourceCategory: l.cat,
      swapCount: l.count,
    })
  }
  for (const l of tinToToutLink.values()) {
    links.push({
      source: l.source,
      target: l.target,
      value: l.usd,
      sourceCategory: l.cat,
      swapCount: l.count,
    })
  }
  links.sort((a, b) => {
    const aSrc = nodeIndex.get(a.source) ?? 0
    const bSrc = nodeIndex.get(b.source) ?? 0
    if (aSrc !== bSrc) return aSrc - bSrc
    const aTgt = nodeIndex.get(a.target) ?? 0
    const bTgt = nodeIndex.get(b.target) ?? 0
    if (aTgt !== bTgt) return aTgt - bTgt
    return CATEGORY_RANK[a.sourceCategory] - CATEGORY_RANK[b.sourceCategory]
  })

  // ── Category share ────────────────────────────────────────────────────
  const categoryShare = emptyCategoryShare()
  for (const { source, usd } of sourceAgg.values()) {
    categoryShare[source.category].usd += usd
  }
  for (const c of ALL_CATEGORIES) {
    categoryShare[c].pct = volumeUsd > 0 ? categoryShare[c].usd / volumeUsd : 0
  }

  return {
    nodes,
    links,
    totals: { volumeUsd, swapCount: eligible.length },
    categoryShare,
    splitUnknownSenders,
    rolledUpSourceIds: rolledUp,
  }
}

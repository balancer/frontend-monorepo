import type { SourceCategory } from './types'

/** Deterministic color per source category. The intent and direct
 *  categories pick up the same accent colors used by `PoolHistoryChart`
 *  for visual continuity within the pool page. */
export const CATEGORY_COLORS: Record<SourceCategory, string> = {
  aggregator:   '#2554ff', // primary.600 (blue) — same as TVL line on history chart
  intent:       '#fb923c', // orange.400 — same as fees on history chart
  direct:       '#25e2a4', // green.400 — Balancer routes from the protocol's own UI/SDK
  mev_bot:      '#d7462b', // red.600 — risk-flagged flow
  market_maker: '#6c4add', // purple.600 — private liquidity / institutional MMs
  bridge:       '#fbbf24', // amber.400 — cross-chain bridge routing
  unknown:      '#718096', // gray.500 — curation backlog
}

/** Display label for a category (legend + tooltips). */
export function formatCategory(cat: SourceCategory): string {
  switch (cat) {
    case 'aggregator':   return 'Aggregators'
    case 'intent':       return 'Intent venues'
    case 'direct':       return 'Balancer direct'
    case 'mev_bot':      return 'MEV bots'
    case 'market_maker': return 'Market makers'
    case 'bridge':       return 'Bridges'
    case 'unknown':      return 'Unknown'
  }
}

/** Render a 0x-address as `0x654f…4be4` for display. Same convention used
 *  in the analytics event log and elsewhere across the app. */
export function shortenAddress(addr: string): string {
  if (!addr.startsWith('0x') || addr.length < 10) return addr
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

/** Truncate a token symbol that's too long to fit in the Sankey's label
 *  channel. Tokens like "Aave Prime GHO" or "Boosted USDC v2" otherwise
 *  get clipped at the chart edge. */
export function truncateLabel(s: string, maxLen = 16): string {
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen - 1)}…`
}

/** Brand-aware display label for a source `id`. Keeps the Sankey's source
 *  column readable instead of showing lowercased internal ids.
 *
 *  Also handles the synthetic `unknown:<address>` ids produced by the
 *  builder's unknown-split feature — those render as a shortened address. */
export function formatSourceId(id: string): string {
  if (id.startsWith('unknown:0x')) {
    return shortenAddress(id.slice('unknown:'.length))
  }
  switch (id) {
    case '1inch':    return '1inch'
    case '0x':       return '0x'
    case 'paraswap': return 'ParaSwap'
    case 'cowswap':  return 'CowSwap'
    case 'mev_bot':  return 'MEV bots'
    case 'balancer': return 'Balancer direct'
    case 'unknown':  return 'Unknown'
    case 'other':    return 'Other'
    case 'lifi':     return 'LI.FI'
    case 'okx':      return 'OKX'
    case 'odos':     return 'Odos'
    case 'dodo':     return 'DODO'
    case 'metamask': return 'MetaMask'
    case 'socket':   return 'Socket'
    case 'debridge': return 'deBridge'
    case 'bungee':   return 'Bungee'
    case 'squid':    return 'Squid'
    case 'rainbow':  return 'Rainbow'
    case 'aori':     return 'Aori'
    case 'swing':    return 'Swing'
    case 'binance':  return 'Binance'
    case 'mm':       return 'Market maker'
    case 'across':   return 'Across'
    case 'lfj':      return 'LFJ (Trader Joe)'
    default:         return id
  }
}

const usdCompact = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 2,
})

const usdFull = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

export const formatUsdCompact = (n: number) => usdCompact.format(n || 0)
export const formatUsdFull    = (n: number) => usdFull.format(n || 0)

export function formatPct(frac: number, digits = 1): string {
  return `${(frac * 100).toFixed(digits)}%`
}

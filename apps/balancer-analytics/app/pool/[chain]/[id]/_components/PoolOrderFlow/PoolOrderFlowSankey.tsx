'use client'

import ReactECharts from 'echarts-for-react'
import { useMemo } from 'react'
import type { SankeyGraph } from './buildSankeyGraph'
import type { SankeySelection } from './PoolOrderFlowDetailsModal'
import type { SourceCategory } from './types'
import {
  CATEGORY_COLORS,
  formatCategory,
  formatPct,
  formatSourceId,
  formatUsdFull,
  shortenAddress,
  truncateLabel,
} from './format'

export type TokenInfo = { symbol: string; logoURI: string | null }
export type TokenMap = Record<string, TokenInfo>

type Props = {
  graph: SankeyGraph
  tokenMap: TokenMap
  /** Total volume of the period — used to compute % share in tooltips. */
  periodVolumeUsd: number
  /** Fired when the user clicks a node or link. The parent owns the
   *  selection state and renders the details drawer accordingly. Click
   *  is intentionally not a "copy" — chart elements aggregate many raw
   *  swaps, so the drawer is where the user picks a specific address. */
  onSelect: (selection: SankeySelection) => void
}

const NODE_NEUTRAL = '#cbd5e1'   // slate-300, for token columns
const LINK_OPACITY = 0.5
const LINK_OPACITY_FOCUS = 0.85
const ICON_SIZE = 16
/** Max characters before token symbols (like "Aave Prime GHO") get truncated
 *  with an ellipsis. Fits comfortably inside the right-margin label channel. */
const MAX_LABEL_CHARS = 16

const TOOLTIP_STYLES = `
  background: rgba(20, 20, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  color: #cbd5e1;
  padding: 8px 12px;
  font-size: 12px;
  line-height: 1.5;
`

function tokenSymbol(addr: string, tokenMap: TokenMap): string {
  return tokenMap[addr]?.symbol ?? shortenAddress(addr)
}

/** Used by the on-canvas chart label (truncates) and by the HTML tooltip
 *  (no truncation — there's space). Pass `truncate = true` for the former. */
function decodeNodeName(name: string, tokenMap: TokenMap, truncate = false): string {
  if (name.startsWith('src:')) return formatSourceId(name.slice(4))
  if (name.startsWith('tin:') || name.startsWith('tout:')) {
    const addr = name.slice(name.indexOf(':') + 1)
    const sym = tokenSymbol(addr, tokenMap)
    return truncate ? truncateLabel(sym, MAX_LABEL_CHARS) : sym
  }
  return name
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => (
    c === '&' ? '&amp;' :
    c === '<' ? '&lt;' :
    c === '>' ? '&gt;' :
    c === '"' ? '&quot;' :
                '&#39;'
  ))
}

/**
 * Pure ECharts wrapper. Consumes the {@link SankeyGraph} produced by
 * `buildSankeyGraph` plus a token-address-to-symbol map and renders a
 * 3-column horizontal Sankey: Source → Token In → Token Out.
 *
 * Colors carry meaning:
 *   - Source nodes are colored by their {@link SourceCategory}.
 *   - Token nodes are neutral (slate-300).
 *   - Links inherit the originating source's category color so a
 *     CowSwap-routed leg is visually distinct from a 1inch-routed leg
 *     even on the shared token→token edge.
 */
export function PoolOrderFlowSankey({ graph, tokenMap, periodVolumeUsd, onSelect }: Props) {
  const option = useMemo(() => {
    const data = graph.nodes.map(n => {
      const color =
        n.kind === 'source'
          ? CATEGORY_COLORS[(n.source?.category ?? 'unknown') as SourceCategory]
          : NODE_NEUTRAL

      // Per-node label override: for token nodes with a logoURI, swap the
      // series-level text formatter for a rich-text formatter that prefixes
      // the symbol with a circular token icon. Nodes without a logo (or
      // source nodes) fall through to the series-level function formatter.
      const baseLabel = { color: '#e2e8f0', fontSize: 12 }
      let label: Record<string, unknown> = baseLabel
      if (n.kind === 'tokenIn' || n.kind === 'tokenOut') {
        const addr = n.tokenAddress ?? ''
        const info = tokenMap[addr]
        const symText = truncateLabel(
          info?.symbol ?? shortenAddress(addr),
          MAX_LABEL_CHARS
        )
        if (info?.logoURI) {
          label = {
            ...baseLabel,
            // ECharts rich text: `{key|content}` segments rendered via the
            // matching `rich` style. Empty `{icon|}` is just the background
            // image, sized to ICON_SIZE × ICON_SIZE and rounded to a circle.
            formatter: `{icon|} {sym|${symText}}`,
            rich: {
              icon: {
                backgroundColor: { image: info.logoURI },
                width: ICON_SIZE,
                height: ICON_SIZE,
                borderRadius: [ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2, ICON_SIZE / 2],
              },
              sym: {
                color: '#e2e8f0',
                fontSize: 12,
                verticalAlign: 'middle',
                padding: [0, 0, 0, 2],
              },
            },
          }
        } else {
          // No icon available — still apply truncation so long token names
          // don't clip at the right edge of the chart.
          label = { ...baseLabel, formatter: symText }
        }
      }

      return {
        name: n.name,
        depth: n.depth,
        itemStyle: { color, borderColor: color },
        label,
      }
    })

    const links = graph.links.map(l => ({
      source: l.source,
      target: l.target,
      value: l.value,
      lineStyle: {
        color: CATEGORY_COLORS[l.sourceCategory],
        opacity: LINK_OPACITY,
      },
      emphasis: { lineStyle: { opacity: LINK_OPACITY_FOCUS } },
    }))

    return {
      tooltip: {
        trigger: 'item',
        backgroundColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        textStyle: { color: '#cbd5e1' },
        formatter: (params: {
          dataType?: string
          name?: string
          value?: number
          data?: { source?: string; target?: string; value?: number }
        }) => {
          if (params.dataType === 'edge' && params.data) {
            const srcLabel = decodeNodeName(params.data.source ?? '', tokenMap)
            const tgtLabel = decodeNodeName(params.data.target ?? '', tokenMap)
            const v = params.data.value ?? 0
            const pct = periodVolumeUsd > 0 ? v / periodVolumeUsd : 0
            return `<div style="${TOOLTIP_STYLES}">
              <div style="color:#E5D3BE;font-weight:600;margin-bottom:4px">
                ${escapeHtml(srcLabel)} → ${escapeHtml(tgtLabel)}
              </div>
              <div>${formatUsdFull(v)} <span style="opacity:.7">(${formatPct(pct)})</span></div>
              <div style="opacity:.55;font-size:10px;margin-top:6px">Click flow for contributor breakdown</div>
            </div>`
          }
          if (params.dataType === 'node' && params.name) {
            const node = graph.nodes.find(n => n.name === params.name)
            if (!node) return ''
            const label = decodeNodeName(params.name, tokenMap)
            const subtitle =
              node.kind === 'source' && node.source
                ? formatCategory(node.source.category)
                : node.kind === 'tokenIn'
                  ? 'Token in'
                  : 'Token out'
            const pct = periodVolumeUsd > 0 ? node.valueUsd / periodVolumeUsd : 0
            return `<div style="${TOOLTIP_STYLES}">
              <div style="color:#E5D3BE;font-weight:600;margin-bottom:4px">
                ${escapeHtml(label)}
              </div>
              <div style="opacity:.7;font-size:11px;margin-bottom:4px">${escapeHtml(subtitle)}</div>
              <div>${formatUsdFull(node.valueUsd)} <span style="opacity:.7">(${formatPct(pct)})</span></div>
              <div style="opacity:.7;font-size:11px">${node.swapCount.toLocaleString()} swap${node.swapCount === 1 ? '' : 's'}</div>
              <div style="opacity:.55;font-size:10px;margin-top:6px">Click for contributor breakdown</div>
            </div>`
          }
          return ''
        },
      },
      series: [
        {
          type: 'sankey',
          // Wide right margin to make room for token icons + symbol text
          // in the rightmost column. "Aave Prime GHO" + icon needs ~140px;
          // we give 160px to keep a small breathing buffer.
          left: 8,
          right: 160,
          top: 8,
          bottom: 8,
          emphasis: { focus: 'adjacency' },
          nodeWidth: 12,
          nodeGap: 8,
          // Disable layout relaxation so node y-positions follow the order
          // of `data` exactly. With relaxation on, ECharts re-derives y from
          // link weights, which means the same source can land at a
          // different position when the user switches 30d → 7d (the weights
          // change). `buildSankeyGraph` already emits nodes in a stable
          // range-invariant order (legend rank for sources, address for
          // tokens), so trusting that order keeps the chart visually
          // anchored across range toggles.
          layoutIterations: 0,
          nodeAlign: 'justify',
          orient: 'horizontal',
          draggable: false,
          label: {
            color: '#e2e8f0',
            fontSize: 12,
            // Used only for source nodes — token nodes set per-node `label`
            // in the data array (with icons / hard-truncated formatter
            // strings). `truncate: true` is still passed for safety in case
            // a future kind of node falls through to the series default.
            formatter: (params: { name: string }) => decodeNodeName(params.name, tokenMap, true),
          },
          lineStyle: {
            curveness: 0.5,
          },
          data,
          links,
        },
      ],
    }
  }, [graph, tokenMap, periodVolumeUsd])

  const handleClick = (params: {
    dataType?: string
    name?: string
    data?: { source?: string; target?: string }
  }) => {
    if (params.dataType === 'node' && params.name) {
      onSelect({ kind: 'node', nodeName: params.name })
      return
    }
    if (params.dataType === 'edge' && params.data?.source && params.data?.target) {
      onSelect({ kind: 'edge', source: params.data.source, target: params.data.target })
    }
  }

  return (
    <ReactECharts
      lazyUpdate
      notMerge
      onEvents={{ click: handleClick }}
      option={option}
      opts={{ renderer: 'canvas' }}
      style={{ height: '100%', width: '100%' }}
    />
  )
}

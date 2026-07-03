/**
 * Pool-type module registry — declarative list of cards that render between
 * the snapshot/history bento and the state panel on the pool detail page.
 *
 * Each entry owns its own gating predicate (`shouldRender`) so adding a new
 * pool-type-specific card (Autorange, LBP timeline, ...) is one entry here
 * plus the component — `PoolPageView` does not need to grow more `&&` chains.
 *
 * Modules run in declaration order. The order-flow module renders first so
 * the universal "where does swap volume come from?" view is always the lead
 * insight; pool-type-specific modules follow underneath.
 *
 * Note: boosted-pool buffer content lives inside `PoolStatePanel`'s Current
 * state grid (as `BufferSection` cards) rather than as a top-level module
 * here — buffer composition + wrapper capacity belongs with the other
 * "current parameters" sections visually, not as a separate page-level card.
 */

import type { PoolPageData } from '../page'
import { PoolAutoRangeHistory } from './PoolAutoRangeHistory/PoolAutoRangeHistory'
import { PoolOrderFlow } from './PoolOrderFlow/PoolOrderFlow'
import { PoolQuantAmmHistory } from './PoolQuantAmmHistory/PoolQuantAmmHistory'

type PoolTypeModule = {
  key: string
  shouldRender: (data: PoolPageData) => boolean
  render: (data: PoolPageData) => React.JSX.Element
}

export const POOL_TYPE_MODULES: readonly PoolTypeModule[] = [
  {
    key: 'order-flow',
    // CowAmm pools route 100% of flow through CowSwap; the Sankey is trivial.
    shouldRender: ({ poolDetail }) => poolDetail.type !== 'COW_AMM',
    render: ({ poolDetail, snapshots }) => (
      <PoolOrderFlow
        chain={poolDetail.chain}
        poolId={poolDetail.id}
        poolTokens={poolDetail.tokens}
        poolTvlUsd={snapshots[snapshots.length - 1]?.totalLiquidity ?? 0}
      />
    ),
  },
  {
    key: 'quantamm-weight-history',
    // BTF / dynamic-weight pools (api-v3 enum `QUANT_AMM_WEIGHTED`). The
    // card hides itself when the pool came back with no `weightSnapshots`
    // (newly-created pool that hasn't published a snapshot yet).
    shouldRender: ({ poolDetail, quantAmm }) =>
      poolDetail.type === 'QUANT_AMM_WEIGHTED' &&
      (quantAmm?.weightSnapshots.length ?? 0) > 0,
    render: ({ poolDetail, range, quantAmm }) => (
      <PoolQuantAmmHistory
        params={quantAmm?.params ?? null}
        range={range}
        tokens={poolDetail.tokens.map(t => ({
          address: t.address,
          symbol: t.symbol,
          logoURI: t.logoURI,
        }))}
        weightSnapshots={quantAmm?.weightSnapshots ?? []}
      />
    ),
  },
  {
    key: 'autorange-history',
    // Gated on contract type — the archive sampler only makes sense for
    // AutoRange (api-v3 enum `RECLAMM`). The card fetches its own state
    // via a client hook so the page render is never blocked on the
    // archive fan-out.
    shouldRender: ({ poolDetail }) => poolDetail.type === 'RECLAMM',
    render: ({ poolDetail, range, state }) => {
      const symbolA = poolDetail.tokens[0]?.symbol ?? 'A'
      const symbolB = poolDetail.tokens[1]?.symbol ?? 'B'
      const marginFraction =
        state.reclamm ? Number(state.reclamm.centerednessMargin) / 1e18 : 0
      return (
        <PoolAutoRangeHistory
          centerednessMarginFraction={marginFraction}
          chain={poolDetail.chain}
          pairLabel={`${symbolB} / ${symbolA}`}
          poolId={poolDetail.id}
          range={range}
        />
      )
    },
  },
]

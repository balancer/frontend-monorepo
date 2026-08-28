import { describe, expect, it } from 'vitest'
import { computePnl } from './usePortfolioPnl'
import type { PortfolioPosition } from './usePortfolioByAddress'
import type { PortfolioPnlPoolEntry } from '@analytics/app/api/portfolio/[address]/pnl/route'

function position(overrides: Partial<PortfolioPosition> = {}): PortfolioPosition {
  return {
    pool: {
      type: 'WEIGHTED',
      poolTokens: [
        { address: '0xweth', balance: '1', balanceUSD: '2000' },
        { address: '0xusdc', balance: '2000', balanceUSD: '2000' },
      ],
    } as PortfolioPosition['pool'],
    chain: 'MAINNET' as PortfolioPosition['chain'],
    positionUsd: 4000,
    walletUsd: 4000,
    stakedUsd: 0,
    shareOfPool: 0.01,
    totalApr: 0,
    feeApr: 0,
    yieldApr: 0,
    rewardApr: 0,
    dailyFeesUsd: 0,
    dailyYieldUsd: 0,
    dailyRewardsUsd: 0,
    aprBreakdown: [],
    stakingType: null,
    ...overrides,
  }
}

function entry(overrides: Partial<PortfolioPnlPoolEntry> = {}): PortfolioPnlPoolEntry {
  return {
    poolId: '0xpool',
    chain: 'MAINNET' as PortfolioPnlPoolEntry['chain'],
    costBasisUsd: 3000,
    netTokens: {
      '0xweth': { amount: 1, valueUsdAtDeposit: 2000 },
      '0xusdc': { amount: 2000, valueUsdAtDeposit: 2000 },
    },
    firstEventAt: 1000,
    addCount: 2,
    removeCount: 0,
    ...overrides,
  }
}

describe('computePnl', () => {
  it('computes P&L and IL for a normal position', () => {
    const result = computePnl(position(), entry(), null, null)
    expect(result.status).toBe('computed')
    // currentUsd 4000, costBasis 3000 → netPnl 1000
    expect(result.netPnlUsd).toBe(1000)
    expect(result.netPnlPct).toBeCloseTo(1000 / 3000)
    // hodl = 1*2000 + 2000*1 = 4000 → il = 4000 - 4000 = 0
    expect(result.hodlUsd).toBe(4000)
    expect(result.ilUsd).toBe(0)
  })

  it('marks pegged-asset pools as stable (IL suppressed)', () => {
    const result = computePnl(
      position({ pool: { type: 'STABLE' } as PortfolioPosition['pool'] }),
      entry(),
      null,
      null
    )

    expect(result.status).toBe('stable')
  })

  it('marks a position with no events as no_history', () => {
    const result = computePnl(position(), null, null, null)
    expect(result.status).toBe('no_history')
  })

  it('marks a no-event position as truncated when a cutoff exists', () => {
    const result = computePnl(position(), null, 500, null)
    expect(result.status).toBe('truncated')
  })

  it('marks a position whose earliest event sits at the cutoff as truncated', () => {
    const result = computePnl(position(), entry({ firstEventAt: 1000 }), 1000, null)
    expect(result.status).toBe('truncated')
  })

  it('marks a re-entered position (negative net token) as exited_and_reentered', () => {
    const result = computePnl(
      position(),
      entry({ netTokens: { '0xweth': { amount: -1, valueUsdAtDeposit: 2000 } } }),
      null,
      null
    )

    expect(result.status).toBe('exited_and_reentered')
  })
})

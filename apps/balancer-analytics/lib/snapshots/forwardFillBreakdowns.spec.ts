import { describe, expect, it } from 'vitest'
import { forwardFillVersionBreakdowns } from './forwardFillBreakdowns'
import type { ProtocolSnapshotPoint, VersionBreakdownSeed } from './types'

function point(
  partial: Partial<ProtocolSnapshotPoint> & { timestamp: number }
): ProtocolSnapshotPoint {
  return {
    totalLiquidity: 0,
    swapVolume24h: 0,
    swapFee24h: 0,
    yieldCapture24h: 0,
    surplus24h: 0,
    poolCount: 0,
    numLiquidityProviders: 0,
    byChain: {},
    ...partial,
  }
}

describe('forwardFillVersionBreakdowns', () => {
  it('attributes CORE−COW using a seed ratio when the window has no V2/V3', () => {
    const seed: VersionBreakdownSeed = {
      v2: { totalLiquidity: 40, swapVolume24h: 10, swapFee24h: 1 },
      v3: { totalLiquidity: 60, swapVolume24h: 30, swapFee24h: 3 },
    }

    const points = [
      point({
        timestamp: 1,
        totalLiquidity: 110,
        swapVolume24h: 50,
        swapFee24h: 5,
        breakdowns: {
          COW_AMM: {
            totalLiquidity: 10,
            swapVolume24h: 10,
            swapFee24h: 1,
            yieldCapture24h: 0,
            surplus24h: 0,
            poolCount: 1,
            byChain: {},
          },
        },
      }),
    ]

    const filled = forwardFillVersionBreakdowns(points, seed)
    expect(filled).toBe(1)
    expect(points[0].breakdowns?.V2?.totalLiquidity).toBeCloseTo(40)
    expect(points[0].breakdowns?.V3?.totalLiquidity).toBeCloseTo(60)
    expect(points[0].breakdowns?.V2?.swapVolume24h).toBeCloseTo(10)
    expect(points[0].breakdowns?.V3?.swapVolume24h).toBeCloseTo(30)

    // Stack still equals CORE
    const stack =
      (points[0].breakdowns?.V2?.totalLiquidity ?? 0) +
      (points[0].breakdowns?.V3?.totalLiquidity ?? 0) +
      (points[0].breakdowns?.COW_AMM?.totalLiquidity ?? 0)

    expect(stack).toBeCloseTo(110)
  })

  it('leaves explicit V2/V3 pairs untouched and uses them as the running ratio', () => {
    const points = [
      point({
        timestamp: 1,
        totalLiquidity: 100,
        breakdowns: {
          V2: {
            totalLiquidity: 25,
            swapVolume24h: 0,
            swapFee24h: 0,
            yieldCapture24h: 0,
            surplus24h: 0,
            poolCount: 0,
            byChain: {},
          },
          V3: {
            totalLiquidity: 75,
            swapVolume24h: 0,
            swapFee24h: 0,
            yieldCapture24h: 0,
            surplus24h: 0,
            poolCount: 0,
            byChain: {},
          },
        },
      }),
      point({
        timestamp: 2,
        totalLiquidity: 200,
        breakdowns: {
          COW_AMM: {
            totalLiquidity: 0,
            swapVolume24h: 0,
            swapFee24h: 0,
            yieldCapture24h: 0,
            surplus24h: 0,
            poolCount: 0,
            byChain: {},
          },
        },
      }),
    ]

    const filled = forwardFillVersionBreakdowns(points, null)
    expect(filled).toBe(1)
    expect(points[0].breakdowns?.V2?.totalLiquidity).toBe(25)
    expect(points[0].breakdowns?.V3?.totalLiquidity).toBe(75)
    expect(points[1].breakdowns?.V2?.totalLiquidity).toBeCloseTo(50)
    expect(points[1].breakdowns?.V3?.totalLiquidity).toBeCloseTo(150)
  })

  it('does nothing when there is no seed and no in-window pair', () => {
    const points = [point({ timestamp: 1, totalLiquidity: 100 })]
    const filled = forwardFillVersionBreakdowns(points, null)
    expect(filled).toBe(0)
    expect(points[0].breakdowns?.V2).toBeUndefined()
    expect(points[0].breakdowns?.V3).toBeUndefined()
  })
})

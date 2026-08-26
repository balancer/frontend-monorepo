import { describe, expect, it } from 'vitest'
import {
  computeParamSnapshot,
  diffSnapshots,
  interpolateTvl,
  sumWindow,
  type MetricSnapshot,
} from './snapshot-at'
import type { PoolParamEvent } from './types'

function event(
  overrides: Partial<PoolParamEvent> & { eventName: string; blockTimestamp: number }
): PoolParamEvent {
  return {
    chain: 'MAINNET' as PoolParamEvent['chain'],
    poolAddress: '0xpool',
    protocolVersion: 3,
    blockNumber: 0,
    logIndex: 0,
    txHash: '0x',
    args: {},
    ...overrides,
  }
}

describe('computeParamSnapshot', () => {
  it('tracks the latest swap fee percentage', () => {
    const events = [
      event({
        eventName: 'SwapFeePercentageChanged',
        blockTimestamp: 10,
        args: { swapFeePercentage: '100000000000000000' },
      }),
      event({
        eventName: 'SwapFeePercentageChanged',
        blockTimestamp: 20,
        args: { swapFeePercentage: '200000000000000000' },
      }),
    ]

    const snap = computeParamSnapshot(events, 30)
    expect(snap.swapFeePercentage).toBe('200000000000000000')
  })

  it('ignores events after the target timestamp', () => {
    const events = [
      event({
        eventName: 'SwapFeePercentageChanged',
        blockTimestamp: 10,
        args: { swapFeePercentage: '100000000000000000' },
      }),
      event({
        eventName: 'SwapFeePercentageChanged',
        blockTimestamp: 50,
        args: { swapFeePercentage: '200000000000000000' },
      }),
    ]

    const snap = computeParamSnapshot(events, 30)
    expect(snap.swapFeePercentage).toBe('100000000000000000')
  })

  it('uses InitialPool* events only as a t0 seed', () => {
    const events = [
      event({
        eventName: 'InitialPoolAggregateSwapFeePercentage',
        blockTimestamp: 1,
        args: { aggregateSwapFeePercentage: '100000000000000000' },
      }),
      event({
        eventName: 'AggregateSwapFeePercentageChanged',
        blockTimestamp: 2,
        args: { aggregateSwapFeePercentage: '200000000000000000' },
      }),
    ]

    const snap = computeParamSnapshot(events, 10)
    expect(snap.aggregateSwapFeePercentage).toBe('200000000000000000')
  })

  it('tracks paused and recovery mode state', () => {
    const events = [
      event({ eventName: 'PoolPausedStateChanged', blockTimestamp: 1, args: { paused: true } }),
      event({
        eventName: 'PoolRecoveryModeStateChanged',
        blockTimestamp: 2,
        args: { recoveryMode: true },
      }),
    ]

    const snap = computeParamSnapshot(events, 10)
    expect(snap.paused).toBe(true)
    expect(snap.recoveryMode).toBe(true)
  })

  it('interpolates amp value inside an active ramp', () => {
    const events = [
      event({
        eventName: 'AmpUpdateStarted',
        blockTimestamp: 1,
        args: {
          startValue: '1000',
          endValue: '2000',
          startTime: '100',
          endTime: '200',
        },
      }),
    ]

    // t = 150 → halfway between 100 and 200 → amp = 1500
    const snap = computeParamSnapshot(events, 150)
    expect(snap.ampValue).toBe('1500')
    expect(snap.ampIsRamping).toBe(true)
  })

  it('uses ramp end value after the ramp completes', () => {
    const events = [
      event({
        eventName: 'AmpUpdateStarted',
        blockTimestamp: 1,
        args: {
          startValue: '1000',
          endValue: '2000',
          startTime: '100',
          endTime: '200',
        },
      }),
    ]

    const snap = computeParamSnapshot(events, 250)
    expect(snap.ampValue).toBe('2000')
    expect(snap.ampIsRamping).toBe(false)
  })

  it('clears the ramp on AmpUpdateStopped', () => {
    const events = [
      event({
        eventName: 'AmpUpdateStarted',
        blockTimestamp: 1,
        args: {
          startValue: '1000',
          endValue: '2000',
          startTime: '100',
          endTime: '200',
        },
      }),
      event({
        eventName: 'AmpUpdateStopped',
        blockTimestamp: 2,
        args: { currentValue: '1500' },
      }),
    ]

    const snap = computeParamSnapshot(events, 150)
    expect(snap.ampValue).toBe('1500')
    expect(snap.ampIsRamping).toBeUndefined()
  })
})

describe('interpolateTvl', () => {
  const snapshots: MetricSnapshot[] = [
    { timestamp: 0, totalLiquidity: 100, volume24h: 0, fees24h: 0 },
    { timestamp: 10, totalLiquidity: 200, volume24h: 0, fees24h: 0 },
  ]

  it('returns 0 for an empty series', () => {
    expect(interpolateTvl([], 5)).toBe(0)
  })

  it('clamps to the first value before the series', () => {
    expect(interpolateTvl(snapshots, -5)).toBe(100)
  })

  it('clamps to the last value after the series', () => {
    expect(interpolateTvl(snapshots, 50)).toBe(200)
  })

  it('linearly interpolates between buckets', () => {
    expect(interpolateTvl(snapshots, 5)).toBe(150)
  })
})

describe('sumWindow', () => {
  const snapshots: MetricSnapshot[] = [
    { timestamp: 0, totalLiquidity: 0, volume24h: 10, fees24h: 1 },
    { timestamp: 10, totalLiquidity: 0, volume24h: 20, fees24h: 2 },
    { timestamp: 20, totalLiquidity: 0, volume24h: 30, fees24h: 3 },
  ]

  it('sums a field over an inclusive window', () => {
    expect(sumWindow(snapshots, 5, 15, 'volume24h')).toBe(20)
  })

  it('handles a reversed window', () => {
    expect(sumWindow(snapshots, 15, 5, 'volume24h')).toBe(20)
  })

  it('sums fees', () => {
    expect(sumWindow(snapshots, 0, 20, 'fees24h')).toBe(6)
  })
})

describe('diffSnapshots', () => {
  it('reports only changed params', () => {
    const changes = diffSnapshots(
      { swapFeePercentage: '100', paused: false },
      { swapFeePercentage: '200', paused: false }
    )

    expect(changes).toHaveLength(1)
    expect(changes[0].key).toBe('swapFeePercentage')
    expect(changes[0].before).toBe('100')
    expect(changes[0].after).toBe('200')
  })

  it('treats unset → set as a change', () => {
    const changes = diffSnapshots({}, { swapFeePercentage: '100' })
    expect(changes).toHaveLength(1)
    expect(changes[0].key).toBe('swapFeePercentage')
  })

  it('ignores params undefined on both sides', () => {
    const changes = diffSnapshots({}, {})
    expect(changes).toHaveLength(0)
  })
})

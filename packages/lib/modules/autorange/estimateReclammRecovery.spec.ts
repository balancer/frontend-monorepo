import { describe, expect, it } from 'vitest'
import { calculateInitialBalances } from './autoRangeMath'
import {
  estimateReclammRecovery,
  formatRecoveryDuration,
  reclammTypeStateToRecoveryInput,
} from './estimateReclammRecovery'

const WAD = 10n ** 18n

describe('formatRecoveryDuration', () => {
  it('formats sub-minute durations', () => {
    expect(formatRecoveryDuration(45)).toBe('~45 s')
  })

  it('formats hours and days', () => {
    expect(formatRecoveryDuration(7200)).toBe('~2 hr')
    expect(formatRecoveryDuration(86400 * 5)).toBe('~5 days')
  })

  it('returns em dash for null', () => {
    expect(formatRecoveryDuration(null)).toBe('—')
  })

  it('returns now for zero', () => {
    expect(formatRecoveryDuration(0)).toBe('now')
  })
})

describe('reclammTypeStateToRecoveryInput', () => {
  it('maps on-chain strings to bigint projection input', () => {
    const input = reclammTypeStateToRecoveryInput(
      {
        liveBalanceA: '1000000000000000000',
        liveBalanceB: '2000000000000000000',
        virtualBalanceA: '5000000000000000000',
        virtualBalanceB: '4000000000000000000',
        centerednessMargin: '50000000000000000',
        dailyPriceShiftExponent: '20000000000000000',
      },
      5
    )

    expect(input.balanceA).toBe(WAD)
    expect(input.balanceB).toBe(2n * WAD)
    expect(input.centerednessMargin).toBe(5n * 10n ** 16n)
    expect(input.dailyPriceShiftExponent).toBe(2n * 10n ** 16n)
    expect(input.marketPrice).toBe(5)
  })
})

describe('estimateReclammRecovery', () => {
  it('returns zero when market price is already in the target band', () => {
    const seeded = calculateInitialBalances({
      minPrice: 0.5,
      maxPrice: 2,
      targetPrice: 1,
    })

    const result = estimateReclammRecovery({
      balanceA: BigInt(Math.round(seeded.balanceA * 1e18)),
      balanceB: BigInt(Math.round(seeded.balanceB * 1e18)),
      virtualBalanceA: BigInt(Math.round(seeded.virtualBalanceA * 1e18)),
      virtualBalanceB: BigInt(Math.round(seeded.virtualBalanceB * 1e18)),
      centerednessMargin: 10n * 10n ** 16n,
      dailyPriceShiftExponent: 2n * 10n ** 16n,
      marketPrice: 1,
    })

    expect(result.secondsToInRange).toBe(0)
  })

  it('projects high-side recovery using 2^dailyShiftExponent price drift', () => {
    const seeded = calculateInitialBalances({
      minPrice: 0.5,
      maxPrice: 2,
      targetPrice: 1,
    })

    const result = estimateReclammRecovery({
      balanceA: BigInt(Math.round(seeded.balanceA * 1e18)),
      balanceB: BigInt(Math.round(seeded.balanceB * 1e18)),
      virtualBalanceA: BigInt(Math.round(seeded.virtualBalanceA * 1e18)),
      virtualBalanceB: BigInt(Math.round(seeded.virtualBalanceB * 1e18)),
      centerednessMargin: 10n * 10n ** 16n,
      dailyPriceShiftExponent: 100n * 10n ** 16n,
      marketPrice: 2.2,
    })

    expect(result.secondsToInRange).toBeGreaterThan(0)
    expect(result.secondsToInRange).toBeLessThan(86400)
  })

  it('projects low-side recovery using 2^dailyShiftExponent price drift', () => {
    const seeded = calculateInitialBalances({
      minPrice: 0.5,
      maxPrice: 2,
      targetPrice: 1,
    })

    const result = estimateReclammRecovery({
      balanceA: BigInt(Math.round(seeded.balanceA * 1e18)),
      balanceB: BigInt(Math.round(seeded.balanceB * 1e18)),
      virtualBalanceA: BigInt(Math.round(seeded.virtualBalanceA * 1e18)),
      virtualBalanceB: BigInt(Math.round(seeded.virtualBalanceB * 1e18)),
      centerednessMargin: 10n * 10n ** 16n,
      dailyPriceShiftExponent: 100n * 10n ** 16n,
      marketPrice: 0.45,
    })

    expect(result.secondsToInRange).not.toBeNull()
    expect(result.secondsToInRange).toBeLessThan(86400)
  })

  it('returns null when market price is unavailable', () => {
    const result = estimateReclammRecovery({
      balanceA: WAD,
      balanceB: 2n * WAD,
      virtualBalanceA: 5n * WAD,
      virtualBalanceB: 4n * WAD,
      centerednessMargin: 10n * 10n ** 16n,
      dailyPriceShiftExponent: 2n * 10n ** 16n,
      marketPrice: null,
    })

    expect(result.secondsToInRange).toBeNull()
  })
})

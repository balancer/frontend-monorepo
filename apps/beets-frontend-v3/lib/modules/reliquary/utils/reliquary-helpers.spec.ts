import { relicGetMaturityProgress } from './reliquary-helpers'
import { ReliquaryFarmPosition } from '../ReliquaryProvider'

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// Real on-chain maturity thresholds: 11 levels, 1 week per level (0 → 10 weeks)
const maturities = [
  '0',
  '604800',
  '1209600',
  '1814400',
  '2419200',
  '3024000',
  '3628800',
  '4233600',
  '4838400',
  '5443200',
  '6048000',
]
const weekInSeconds = 604800

function makeRelic(overrides: Partial<ReliquaryFarmPosition> = {}): ReliquaryFarmPosition {
  return {
    farmId: '0', // real fBEETS farmId on Sonic
    relicId: '42',
    amount: '100',
    entry: 0,
    level: 0,
    ...overrides,
  }
}

describe('relicGetMaturityProgress', () => {
  describe('null / empty inputs', () => {
    test('returns defaults when relic is null', () => {
      const result = relicGetMaturityProgress(null, maturities)

      expect(result.canUpgrade).toBe(false)
      expect(result.canUpgradeTo).toBe(-1)
      expect(result.progressToNextLevel).toBe(0)
      expect(result.isMaxMaturity).toBe(false)
    })

    test('returns defaults when maturities is empty', () => {
      const result = relicGetMaturityProgress(makeRelic(), [])

      expect(result.canUpgrade).toBe(false)
      expect(result.canUpgradeTo).toBe(-1)
      expect(result.progressToNextLevel).toBe(0)
      expect(result.isMaxMaturity).toBe(false)
    })
  })

  describe('brand new relic (level 0, just created)', () => {
    test('cannot upgrade and shows progress toward level 1', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      const relic = makeRelic({ entry: now, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(false)
      expect(result.isMaxMaturity).toBe(false)
      expect(result.progressToNextLevel).toBeCloseTo(0, 0)
    })
  })

  describe('relic eligible for upgrade', () => {
    test('canUpgrade is true when time elapsed exceeds next level threshold', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic created 2 weeks ago, still at level 0
      const twoWeeksAgo = now - 2 * weekInSeconds
      const relic = makeRelic({ entry: twoWeeksAgo, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(true)
      expect(result.canUpgradeTo).toBeGreaterThan(0)
    })

    test('canUpgradeTo reflects the correct level', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic created 5 weeks ago, still at level 0 → should be upgradable to level 5
      const fiveWeeksAgo = now - 5 * weekInSeconds
      const relic = makeRelic({ entry: fiveWeeksAgo, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(true)
      // 5 weeks elapsed: passes thresholds[0..5] → canUpgradeTo = 6
      expect(result.canUpgradeTo).toBe(6)
    })
  })

  describe('relic already at correct level', () => {
    test('canUpgrade is false when relic is at the correct level for elapsed time', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic created 1.5 weeks ago, at level 1 (correct for >1 week but <2 weeks)
      const oneAndHalfWeeksAgo = now - 1.5 * weekInSeconds
      const relic = makeRelic({ entry: oneAndHalfWeeksAgo, level: 1 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(false)
      expect(result.isMaxMaturity).toBe(false)
    })
  })

  describe('max maturity', () => {
    test('isMaxMaturity is true when time elapsed exceeds all thresholds (>10 weeks)', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic created 11 weeks ago (exceeds max maturity of 10 weeks)
      const elevenWeeksAgo = now - 11 * weekInSeconds
      const relic = makeRelic({ entry: elevenWeeksAgo, level: 9 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.isMaxMaturity).toBe(true)
      expect(result.canUpgradeTo).toBe(maturities.length)
    })

    test('canUpgrade is true when at max maturity but level not yet at max', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic created 11 weeks ago but still at level 5
      const elevenWeeksAgo = now - 11 * weekInSeconds
      const relic = makeRelic({ entry: elevenWeeksAgo, level: 5 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.isMaxMaturity).toBe(true)
      expect(result.canUpgrade).toBe(true)
    })

    test('canUpgrade is false when already at max level', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic at max level (10) and max maturity (>10 weeks)
      const elevenWeeksAgo = now - 11 * weekInSeconds
      const relic = makeRelic({ entry: elevenWeeksAgo, level: maturities.length - 1 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.isMaxMaturity).toBe(true)
      expect(result.canUpgrade).toBe(false)
    })
  })

  describe('progressToNextLevel', () => {
    test('returns 100 when upgrade is available', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // 2 weeks elapsed, still at level 0 → can upgrade
      const twoWeeksAgo = now - 2 * weekInSeconds
      const relic = makeRelic({ entry: twoWeeksAgo, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(true)
      expect(result.progressToNextLevel).toBe(100)
    })

    test('returns partial progress when between levels', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      // Relic at level 1, created 1.5 weeks ago → 0.5 weeks into level 1 period
      const oneAndHalfWeeksAgo = now - 1.5 * weekInSeconds
      const relic = makeRelic({ entry: oneAndHalfWeeksAgo, level: 1 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.canUpgrade).toBe(false)
      // Progress = timeElapsedSinceCurrentLevel / weekInSeconds * 100
      // timeElapsedSinceCurrentLevel = now - (maturities[1] + entry) = 0.5 weeks
      expect(result.progressToNextLevel).toBeCloseTo(50, 0)
    })
  })

  describe('entryDate and levelUpDate', () => {
    test('entryDate matches the relic entry timestamp', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      const entry = 1_699_000_000
      const relic = makeRelic({ entry, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      expect(result.entryDate.getTime()).toBe(entry * 1000)
    })

    test('levelUpDate is entry + next maturity threshold', () => {
      const now = 1_700_000_000
      vi.setSystemTime(new Date(now * 1000))

      const entry = 1_699_500_000
      const relic = makeRelic({ entry, level: 0 })
      const result = relicGetMaturityProgress(relic, maturities)

      // For level 0, next level is maturities[1] = 604800 seconds (1 week)
      const expectedLevelUpDate = new Date((entry + 604800) * 1000)
      expect(result.levelUpDate.getTime()).toBe(expectedLevelUpDate.getTime())
    })
  })
})

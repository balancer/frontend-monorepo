import { calculateMaturityImpact, MaturityImpactInput } from './maturity-impact'

// Maturity thresholds: 0s, 1w, 2w, 3w, 4w, 5w
const thresholds = ['0', '604800', '1209600', '1814400', '2419200', '3024000']
const weekInSeconds = 604800

function makeInput(overrides: Partial<MaturityImpactInput> = {}): MaturityImpactInput {
  return {
    amount: '100',
    positionAmount: '100',
    positionEntry: 1_700_000_000,
    levelOnUpdate: 0,
    maturityThresholds: thresholds,
    nowTimestamp: 1_700_000_000 + 2 * weekInSeconds,
    ...overrides,
  }
}

describe('calculateMaturityImpact', () => {
  describe('maturity tracking', () => {
    test('calculates old maturity as time elapsed since entry', () => {
      const entry = 1_700_000_000
      const now = entry + 3 * weekInSeconds
      const result = calculateMaturityImpact(makeInput({ positionEntry: entry, nowTimestamp: now }))

      expect(result.oldMaturity).toBe(3 * weekInSeconds)
    })

    test('new maturity is reduced based on add liquidity weight', () => {
      const entry = 1_700_000_000
      const now = entry + 2 * weekInSeconds

      // Adding 100 to existing 100 → weight = 0.5
      // maturity = 2 weeks, entry shifts by maturity * 0.5 = 1 week
      // newMaturity = 2 weeks - 1 week = 1 week
      const result = calculateMaturityImpact(
        makeInput({ positionEntry: entry, nowTimestamp: now, amount: '100', positionAmount: '100' })
      )

      expect(result.newMaturity).toBeCloseTo(weekInSeconds, -1)
    })

    test('small add has minimal maturity impact', () => {
      const entry = 1_700_000_000
      const now = entry + 4 * weekInSeconds

      // Adding 1 to existing 1000 → weight ≈ 0.001
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '1',
          positionAmount: '1000',
        })
      )

      // New maturity should be very close to old maturity (within ~0.1%)
      const diff = Math.abs(result.oldMaturity - result.newMaturity)
      expect(diff / result.oldMaturity).toBeLessThan(0.002)
    })

    test('large add has major maturity impact', () => {
      const entry = 1_700_000_000
      const now = entry + 4 * weekInSeconds

      // Adding 10000 to existing 100 → weight ≈ 0.99
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '10000',
          positionAmount: '100',
        })
      )

      // New maturity should be near 0
      expect(result.newMaturity).toBeLessThan(weekInSeconds)
    })
  })

  describe('level calculation', () => {
    test('newLevel is determined by new maturity against thresholds', () => {
      const entry = 1_700_000_000
      const now = entry + 4 * weekInSeconds

      // Adding 100 to existing 100 → weight 0.5 → newMaturity = 2 weeks
      // 2 weeks = 1209600s, which passes thresholds[0]=0 and thresholds[1]=604800 and thresholds[2]=1209600
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '100',
          positionAmount: '100',
          levelOnUpdate: 3,
        })
      )

      expect(result.oldLevel).toBe(3)
      expect(result.newLevel).toBe(2)
    })

    test('newLevel stays at 0 when maturity is fully reset', () => {
      const entry = 1_700_000_000
      const now = entry + weekInSeconds

      // Adding 100000 to existing 1 → weight ≈ 1 → new maturity ≈ 0
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '100000',
          positionAmount: '1',
          levelOnUpdate: 1,
        })
      )

      expect(result.newLevel).toBe(0)
    })
  })

  describe('level progress strings', () => {
    test('shows progress fraction when not at max', () => {
      const entry = 1_700_000_000
      const now = entry + 2 * weekInSeconds

      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          levelOnUpdate: 1,
          amount: '100',
          positionAmount: '100',
        })
      )

      // oldLevelProgress = maturity/thresholds[levelOnUpdate+1] = "1209600/1209600"
      expect(result.oldLevelProgress).toContain('/')
      expect(result.newLevelProgress).toContain('/')
    })

    test('shows max level reached when at max level', () => {
      const entry = 1_700_000_000
      const maxLevel = thresholds.length - 1
      const now = entry + 6 * weekInSeconds

      // Adding small amount to keep at max
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          levelOnUpdate: maxLevel,
          amount: '1',
          positionAmount: '10000',
        })
      )

      expect(result.oldLevelProgress).toBe('max level reached')
    })
  })

  describe('staysMax flag', () => {
    test('staysMax is true when both old and new are at max level', () => {
      const entry = 1_700_000_000
      const maxLevel = thresholds.length - 1
      const now = entry + 10 * weekInSeconds

      // Small add: maturity barely changes
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          levelOnUpdate: maxLevel,
          amount: '1',
          positionAmount: '10000',
        })
      )

      expect(result.staysMax).toBe(true)
    })

    test('staysMax is false when dropping from max', () => {
      const entry = 1_700_000_000
      const maxLevel = thresholds.length - 1
      const now = entry + 6 * weekInSeconds

      // Large add: resets maturity significantly
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          levelOnUpdate: maxLevel,
          amount: '100000',
          positionAmount: '100',
        })
      )

      expect(result.staysMax).toBe(false)
    })
  })

  describe('addLiquidityMaturityImpactTimeInMilliseconds', () => {
    test('represents remaining time to reach max maturity', () => {
      const entry = 1_700_000_000
      const now = entry + 2 * weekInSeconds
      const MAX_MATURITY = 6048000

      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '100',
          positionAmount: '100',
        })
      )

      const expectedMs = (MAX_MATURITY - result.newMaturity) * 1000
      expect(result.addLiquidityMaturityImpactTimeInMilliseconds).toBe(expectedMs)
    })
  })
})

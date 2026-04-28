import { calculateMaturityImpact, MaturityImpactInput } from './maturity-impact'

// Real on-chain maturity thresholds: 11 levels, 1 week per level (0 → 10 weeks)
const thresholds = [
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
      const now = entry + 5 * weekInSeconds
      const result = calculateMaturityImpact(makeInput({ positionEntry: entry, nowTimestamp: now }))

      expect(result.oldMaturity).toBe(5 * weekInSeconds)
    })

    test('new maturity is reduced based on add liquidity weight', () => {
      const entry = 1_700_000_000
      const now = entry + 4 * weekInSeconds

      // Adding 100 to existing 100 → weight = 0.5
      // maturity = 4 weeks, entry shifts by maturity * 0.5 = 2 weeks
      // newMaturity = 4 weeks - 2 weeks = 2 weeks
      const result = calculateMaturityImpact(
        makeInput({ positionEntry: entry, nowTimestamp: now, amount: '100', positionAmount: '100' })
      )

      expect(result.newMaturity).toBeCloseTo(2 * weekInSeconds, -1)
    })

    test('small add has minimal maturity impact', () => {
      const entry = 1_700_000_000
      const now = entry + 8 * weekInSeconds

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
      const now = entry + 8 * weekInSeconds

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
      const now = entry + 8 * weekInSeconds

      // Adding 100 to existing 100 → weight 0.5 → newMaturity = 4 weeks
      // 4 weeks = 2419200s → passes thresholds[0..4] → newLevel = 4
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '100',
          positionAmount: '100',
          levelOnUpdate: 7,
        })
      )

      expect(result.oldLevel).toBe(7)
      expect(result.newLevel).toBe(4)
    })

    test('newLevel stays at 0 when maturity is fully reset', () => {
      const entry = 1_700_000_000
      const now = entry + 3 * weekInSeconds

      // Adding 100000 to existing 1 → weight ≈ 1 → new maturity ≈ 0
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '100000',
          positionAmount: '1',
          levelOnUpdate: 3,
        })
      )

      expect(result.newLevel).toBe(0)
    })
  })

  describe('level progress strings', () => {
    test('shows progress fraction when not at max', () => {
      const entry = 1_700_000_000
      const now = entry + 4 * weekInSeconds

      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          levelOnUpdate: 3,
          amount: '100',
          positionAmount: '100',
        })
      )

      // oldLevelProgress = maturity/thresholds[levelOnUpdate+1]
      expect(result.oldLevelProgress).toContain('/')
      expect(result.newLevelProgress).toContain('/')
    })

    test('shows max level reached when at max level', () => {
      const entry = 1_700_000_000
      const maxLevel = thresholds.length - 1 // level 10
      const now = entry + 11 * weekInSeconds

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
      const maxLevel = thresholds.length - 1 // level 10
      const now = entry + 11 * weekInSeconds

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
      const maxLevel = thresholds.length - 1 // level 10
      const now = entry + 11 * weekInSeconds

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
      const now = entry + 4 * weekInSeconds
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

    test('clamps to zero when newMaturity exceeds MAX_MATURITY', () => {
      const entry = 1_700_000_000
      const now = entry + 15 * weekInSeconds // 15 weeks old position

      // Small add to a long-held position: newMaturity stays close to 15 weeks (> MAX_MATURITY)
      const result = calculateMaturityImpact(
        makeInput({
          positionEntry: entry,
          nowTimestamp: now,
          amount: '1',
          positionAmount: '1000',
        })
      )

      expect(result.newMaturity).toBeGreaterThan(6048000)
      expect(result.addLiquidityMaturityImpactTimeInMilliseconds).toBe(0)
    })
  })
})

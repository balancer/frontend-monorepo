import BigNumber from 'bignumber.js'
import {
  bn,
  BN_LOWER_THRESHOLD,
  fNum,
  fNumCustom,
  formatFalsyValueAsDash,
  isBnParseable,
  isGreaterThanZeroValidation,
  isValidNumber,
  sum,
  ZERO_VALUE_DASH,
} from './numbers'

test('Stringifies bigints', () => {
  expect(JSON.stringify(12345n)).toBe('"12345"')
})

describe('fiatFormat', () => {
  test('Abbreviated formats', () => {
    expect(fNum('fiat', '0.000000000000000001')).toBe('<0.001')
    expect(fNum('fiat', '0.00013843061948487287')).toBe('<0.001')
    expect(fNum('fiat', '0.001234')).toBe('0.001')
    expect(fNum('fiat', '0.001987')).toBe('0.002')
    expect(fNum('fiat', '0.006')).toBe('0.006')
    expect(fNum('fiat', '0.012345')).toBe('0.01')
    expect(fNum('fiat', '0.123456789')).toBe('0.12')
    expect(fNum('fiat', '0')).toBe('0.00')
    expect(fNum('fiat', '1')).toBe('1.00')
    expect(fNum('fiat', '1.234')).toBe('1.23')
    expect(fNum('fiat', '10')).toBe('10.00')
    expect(fNum('fiat', '10.1234')).toBe('10.12')
    expect(fNum('fiat', '100')).toBe('100.00')
    expect(fNum('fiat', '123.456')).toBe('123.46')
    expect(fNum('fiat', '12345')).toBe('12.35k')
    expect(fNum('fiat', '12345.6789')).toBe('12.35k')
    expect(fNum('fiat', '123456789.12345678')).toBe('123.46m')
  })

  test('Non-abbreviated formats', () => {
    expect(fNum('fiat', '0.000000000000000001')).toBe('<0.001')
    expect(fNum('fiat', '0.00269693621158015889', { abbreviated: false })).toBe('0.003')
    expect(fNum('fiat', '56789.12345678', { abbreviated: false })).toBe('56,789.12')
  })

  test('Forcing 3 decimals', () => {
    expect(fNum('fiat', '0.555')).toBe('0.56')
    expect(fNum('fiat', '0.555', { forceThreeDecimals: true })).toBe('0.555')
  })

  test('Hide cents when value >= 100k', () => {
    expect(fNum('fiat', '123456789.12345678', { abbreviated: false })).toBe('123,456,789')
  })
})

describe('tokenFormat', () => {
  test('Abbreviated formats', () => {
    expect(fNum('token', '0.001')).toBe('0.001')
    expect(fNum('token', '0.006')).toBe('0.006')
    expect(fNum('token', '0.0001')).toBe('0.0001')
    expect(fNum('token', '0.00001')).toBe('< 0.00001')
    expect(fNum('token', '0.0000001')).toBe('< 0.00001')
    expect(fNum('token', '0.000493315290277')).toBe('0.0005')
    expect(fNum('token', '0.0000493315290277')).toBe('< 0.0001')
    expect(fNum('token', '0.000000493315290277')).toBe('< 0.00001')
    expect(fNum('token', '0.012345')).toBe('0.0123')
    expect(fNum('token', '0.123456789')).toBe('0.1235')
    expect(fNum('token', '0')).toBe('0')
    expect(fNum('token', '1')).toBe('1')
    expect(fNum('token', '1.234')).toBe('1.234')
    expect(fNum('token', '10')).toBe('10')
    expect(fNum('token', '10.1234')).toBe('10.1234')
    expect(fNum('token', '100')).toBe('100')
    expect(fNum('token', '123.456')).toBe('123.456')
    expect(fNum('token', '12345')).toBe('12.35k')
    expect(fNum('token', '2157.12345')).toBe('2.16k')
    expect(fNum('token', '123456789.12345678')).toBe('123.46m')
  })

  test('Non-abbreviated formats', () => {
    expect(fNum('token', '56789.12345678', { abbreviated: false })).toBe('56,789.1235')
  })
})

describe('aprFormat', () => {
  test('Abbreviated formats', () => {
    expect(fNum('apr', '0.10')).toBe('10.00%')
    expect(fNum('apr', '0.0010')).toBe('0.10%')
    expect(fNum('apr', '0.0016')).toBe('0.16%')
    expect(fNum('apr', '0.0001')).toBe('0.01%')
    expect(fNum('apr', '0.00001')).toBe('<0.01%')
    expect(fNum('apr', '0.00009')).toBe('<0.01%')
    expect(fNum('apr', '0.000007595846919227514')).toBe('<0.01%')
    expect(fNum('apr', '1.3456789')).toBe('134.57%')
    // Big percentages > 1000%
    expect(fNum('apr', '12.3456789')).toBe('1,235%')
  })
})

describe('fee Percent', () => {
  test('Abbreviated formats', () => {
    expect(fNum('feePercent', '0.10')).toBe('10%')
    expect(fNum('feePercent', '0.0010')).toBe('0.1%')
    expect(fNum('feePercent', '0.0016')).toBe('0.16%')
    expect(fNum('feePercent', '0.0001')).toBe('0.01%')
    expect(fNum('feePercent', '0.00001')).toBe('<0.01%')
    expect(fNum('feePercent', '0.00009')).toBe('<0.01%')
    expect(fNum('feePercent', '0.00009', { hideSmallPercentage: false })).toBe('0.009%')
    expect(fNum('feePercent', '0.000007595846919227514')).toBe('<0.01%')
  })
})

describe('percentage', () => {
  test('Abbreviated formats', () => {
    expect(fNum('percentage', '0.10')).toBe('10%')
    expect(fNum('percentage', '0.0010')).toBe('0%')
    expect(fNum('percentage', '0.0016')).toBe('0%')
    expect(fNum('percentage', '0.0001')).toBe('0%')
    expect(fNum('percentage', '0.00001')).toBe('0%')
    expect(fNum('percentage', '0.00009')).toBe('0%')
    expect(fNum('percentage', '0.000007595846919227514')).toBe('0%')
  })
})

describe('sharePercent', () => {
  test('Abbreviated formats', () => {
    expect(fNum('sharePercent', '0.10')).toBe('10%')
    expect(fNum('sharePercent', '0.0010')).toBe('0.1%')
    expect(fNum('sharePercent', '0.0016')).toBe('0.16%')
    expect(fNum('sharePercent', '0.0001')).toBe('0.01%')
    expect(fNum('sharePercent', '0.00001')).toBe('<0.01%')
    expect(fNum('sharePercent', '0.00009')).toBe('<0.01%')
    expect(fNum('sharePercent', '0.000007595846919227514')).toBe('<0.01%')
  })
})

describe('slippage', () => {
  test('Abbreviated formats', () => {
    expect(fNum('slippage', '0.10')).toBe('0.10%')
    expect(fNum('slippage', '0.0010')).toBe('<0.01%')
    expect(fNum('slippage', '0.0016')).toBe('<0.01%')
    expect(fNum('slippage', '0.0001')).toBe('<0.01%')
    expect(fNum('slippage', '0.00009')).toBe('<0.01%')
    expect(fNum('slippage', '0.000007595846919227514')).toBe('<0.01%')
  })
})

describe('weight', () => {
  test('Abbreviated format', () => {
    expect(fNum('weight', '0.5')).toBe('50%')
    expect(fNum('weight', '0.255')).toBe('26%')
    expect(fNum('weight', '0.254')).toBe('25%')
    expect(fNum('weight', '0.8')).toBe('80%')
    expect(fNum('weight', '0.333')).toBe('33%')
    expect(fNum('weight', '1')).toBe('100%')
    expect(fNum('weight', '0.005')).toBe('1%')
    expect(fNum('weight', '0.999')).toBe('100%')
  })

  test('Non-abbreviated formats', () => {
    expect(fNum('weight', '0.5', { abbreviated: false })).toBe('50.00%')
    expect(fNum('weight', '0.255', { abbreviated: false })).toBe('25.50%')
    expect(fNum('weight', '0.2545', { abbreviated: false })).toBe('25.45%')
    expect(fNum('weight', '0.333', { abbreviated: false })).toBe('33.30%')
    expect(fNum('weight', '0.5', { abbreviated: false, decimals: 1 })).toBe('50.0%')
    expect(fNum('weight', '0.255', { abbreviated: false, decimals: 1 })).toBe('25.5%')
    expect(fNum('weight', '0.254', { abbreviated: false, decimals: 1 })).toBe('25.4%')
    expect(fNum('weight', '0.333', { abbreviated: false, decimals: 1 })).toBe('33.3%')
  })
})

describe('boost', () => {
  test('Fixed 3 decimals', () => {
    expect(fNum('boost', '1')).toBe('1.000')
    expect(fNum('boost', '2.5')).toBe('2.500')
    expect(fNum('boost', '1.2345')).toBe('1.235')
    expect(fNum('boost', '1.2344')).toBe('1.234')
    expect(fNum('boost', '0.0004')).toBe('0.000')
    expect(fNum('boost', '2.9999')).toBe('3.000')
    expect(fNum('boost', '12.3456789')).toBe('12.346')
  })
})

describe('tokenRatio', () => {
  test('Fixed decimal bands', () => {
    expect(fNum('tokenRatio', '0.000123456')).toBe('0.000123')
    expect(fNum('tokenRatio', '0.0009999')).toBe('0.001000')
    expect(fNum('tokenRatio', '0.001')).toBe('0.00100')
    expect(fNum('tokenRatio', '0.00555')).toBe('0.00555')
    expect(fNum('tokenRatio', '0.009999')).toBe('0.01000')
    expect(fNum('tokenRatio', '0.01')).toBe('0.0100')
    expect(fNum('tokenRatio', '0.123456')).toBe('0.1235')
    expect(fNum('tokenRatio', '1.199999')).toBe('1.2000')
    expect(fNum('tokenRatio', '1.2')).toBe('1.200')
    expect(fNum('tokenRatio', '1.5555')).toBe('1.556')
    expect(fNum('tokenRatio', '1.999')).toBe('1.999')
    expect(fNum('tokenRatio', '2')).toBe('2.00')
    expect(fNum('tokenRatio', '9.999')).toBe('10.00')
    expect(fNum('tokenRatio', '10')).toBe('10.0')
    expect(fNum('tokenRatio', '99.99')).toBe('100.0')
    expect(fNum('tokenRatio', '100')).toBe('100')
    expect(fNum('tokenRatio', '1234.5678')).toBe('1,235')
    expect(fNum('tokenRatio', '999999')).toBe('999,999')
  })
})

describe('integer', () => {
  test('Grouped integer format', () => {
    expect(fNum('integer', '0')).toBe('0')
    expect(fNum('integer', '1')).toBe('1')
    expect(fNum('integer', '0.4')).toBe('0')
    expect(fNum('integer', '0.5')).toBe('1')
    expect(fNum('integer', '12.3456789')).toBe('12')
    expect(fNum('integer', '999.4')).toBe('999')
    expect(fNum('integer', '999.5')).toBe('1,000')
    expect(fNum('integer', '1234.4')).toBe('1,234')
    expect(fNum('integer', '1234.5')).toBe('1,235')
    expect(fNum('integer', '1234.5678')).toBe('1,235')
    expect(fNum('integer', '999999.9')).toBe('1,000,000')
    expect(fNum('integer', '123456789')).toBe('123,456,789')
  })
})

describe('priceImpact', () => {
  test('Fixed 2 decimal percentage', () => {
    expect(fNum('priceImpact', '0.05')).toBe('5.00%')
    expect(fNum('priceImpact', '0.055')).toBe('5.50%')
    expect(fNum('priceImpact', '0.001')).toBe('0.10%')
    expect(fNum('priceImpact', '0.0001')).toBe('0.01%')
    expect(fNum('priceImpact', '0.2545')).toBe('25.45%')
    expect(fNum('priceImpact', '0.9999')).toBe('99.99%')
    expect(fNum('priceImpact', '1')).toBe('100.00%')
    expect(fNum('priceImpact', '12.345')).toBe('1,234.50%')
  })

  test('Small values below the threshold', () => {
    expect(fNum('priceImpact', '0.00001')).toBe('<0.01%')
    expect(fNum('priceImpact', '0.00009')).toBe('<0.01%')
  })
})

describe('stakedPercentage', () => {
  test('Routes through priceImpact format', () => {
    expect(fNum('stakedPercentage', '0.5')).toBe('50.00%')
    expect(fNum('stakedPercentage', '0.2545')).toBe('25.45%')
    expect(fNum('stakedPercentage', '1')).toBe('100.00%')
    expect(fNum('stakedPercentage', '0.0001')).toBe('0.01%')
    expect(fNum('stakedPercentage', '0.00001')).toBe('<0.01%')
  })
})

describe('fNumCustom', () => {
  // Golden outputs captured from numeral 2.0.6 for every format string used by
  // fNumCustom call sites (see issue #2643 inventory).

  test("'0a' — abbreviated integer (PoolsPage liquidity providers count)", () => {
    expect(fNumCustom('0', '0a')).toBe('0')
    expect(fNumCustom('5', '0a')).toBe('5')
    expect(fNumCustom('999', '0a')).toBe('999')
    expect(fNumCustom('1000', '0a')).toBe('1k')
    expect(fNumCustom('1500', '0a')).toBe('2k')
    expect(fNumCustom('12345', '0a')).toBe('12k')
    expect(fNumCustom('999499', '0a')).toBe('999k')
    expect(fNumCustom('999500', '0a')).toBe('1m')
    expect(fNumCustom('1000000', '0a')).toBe('1m')
    expect(fNumCustom('2500000', '0a')).toBe('3m')
    expect(fNumCustom('1234567890', '0a')).toBe('1b')
  })

  test("'0.00[00]%' — swap fee (PoolSwapFees)", () => {
    expect(fNumCustom('0.001', '0.00[00]%')).toBe('0.10%')
    expect(fNumCustom('0.0001', '0.00[00]%')).toBe('0.01%')
    expect(fNumCustom('0.0025', '0.00[00]%')).toBe('0.25%')
    expect(fNumCustom('0.005', '0.00[00]%')).toBe('0.50%')
    expect(fNumCustom('0.01', '0.00[00]%')).toBe('1.00%')
    expect(fNumCustom('0.1', '0.00[00]%')).toBe('10.00%')
    expect(fNumCustom('0.000001', '0.00[00]%')).toBe('0.0001%')
    expect(fNumCustom('0.0000001', '0.00[00]%')).toBe('0.00%')
    expect(fNumCustom('0.5', '0.00[00]%')).toBe('50.00%')
    expect(fNumCustom('1', '0.00[00]%')).toBe('100.00%')
  })

  test("'0.00000000' — ECLP config values (NUM_FORMAT)", () => {
    expect(fNumCustom('1', '0.00000000')).toBe('1.00000000')
    expect(fNumCustom('1.23456789', '0.00000000')).toBe('1.23456789')
    expect(fNumCustom('1.234567891', '0.00000000')).toBe('1.23456789')
    expect(fNumCustom('0.5', '0.00000000')).toBe('0.50000000')
    expect(fNumCustom('123.456', '0.00000000')).toBe('123.45600000')
    expect(fNumCustom('0.999999999', '0.00000000')).toBe('1.00000000')
    // numeral bug: values below 1e-7 hit its pow(10, p) overflow guard and return
    // NaN. ECLP config values are prices >= ~1e-4 in practice; we do not inherit
    // the NaN and format correctly instead.
    expect(fNumCustom('0.00000001', '0.00000000')).toBe('0.00000001')
  })

  test("'0,0' — grouped integer (ClpPoolAttributes lambda)", () => {
    expect(fNumCustom('0', '0,0')).toBe('0')
    expect(fNumCustom('1', '0,0')).toBe('1')
    expect(fNumCustom('0.4', '0,0')).toBe('0')
    expect(fNumCustom('0.5', '0,0')).toBe('1')
    expect(fNumCustom('1234.5', '0,0')).toBe('1,235')
    expect(fNumCustom('9999', '0,0')).toBe('9,999')
  })

  test("'0.000000' — pool creation formatNumber default band", () => {
    expect(fNumCustom('0', '0.000000')).toBe('0.000000')
    expect(fNumCustom('0.123456789', '0.000000')).toBe('0.123457')
    expect(fNumCustom('1', '0.000000')).toBe('1.000000')
    expect(fNumCustom('1.5', '0.000000')).toBe('1.500000')
    expect(fNumCustom('999.999999', '0.000000')).toBe('999.999999')
    expect(fNumCustom('1000', '0.000000')).toBe('1000.000000')
  })

  test("'0,000.00' — pool creation formatNumber > 1k band", () => {
    expect(fNumCustom('1001', '0,000.00')).toBe('1,001.00')
    expect(fNumCustom('1234.5678', '0,000.00')).toBe('1,234.57')
    expect(fNumCustom('99999.999', '0,000.00')).toBe('100,000.00')
    expect(fNumCustom('100000', '0,000.00')).toBe('100,000.00')
  })

  test("'0,000' — pool creation formatNumber > 100k band", () => {
    expect(fNumCustom('100001', '0,000')).toBe('100,001')
    expect(fNumCustom('123456.789', '0,000')).toBe('123,457')
    expect(fNumCustom('999999.9', '0,000')).toBe('1,000,000')
    expect(fNumCustom('123456789', '0,000')).toBe('123,456,789')
  })

  test("'0.000' — boost format (already supported fast path)", () => {
    expect(fNumCustom('1', '0.000')).toBe('1.000')
    expect(fNumCustom('2.5', '0.000')).toBe('2.500')
    expect(fNumCustom('1.2345', '0.000')).toBe('1.235')
  })
})

describe('bn', () => {
  test('creates a BigNumber instance from different formats', () => {
    expect(bn(1234567).toFixed()).toBe('1234567')
    expect(bn('54321').toFixed()).toBe('54321')
    expect(bn(12345n).toFixed()).toBe('12345')
    expect(bn('0.0000000000000035').toFixed()).toBe('0.0000000000000035')
  })

  test('throws for invalid string inputs', () => {
    expect(() => bn('')).toThrow()
    expect(() => bn(' ')).toThrow()
    expect(() => bn('abc')).toThrow()
  })

  test('throws for nullish inputs passed at runtime', () => {
    expect(() => bn(undefined as any)).toThrow(TypeError)
    expect(() => bn(null as any)).toThrow(TypeError)
  })

  test('enables strict mode globally', () => {
    expect(() => new BigNumber('abc')).toThrow()
    expect(() => new BigNumber('')).toThrow()
  })
})

test('all formats types do not break with super small inputs (AKA dust)', () => {
  const dust = BN_LOWER_THRESHOLD
  expect(fNum('apr', dust)).toBe('<0.01%')
  expect(fNum('feePercent', dust)).toBe('<0.01%')
  expect(fNum('fiat', dust)).toBe('<0.001')
  expect(fNum('integer', dust)).toBe('0')
  expect(fNum('percentage', dust)).toBe('0%')
  expect(fNum('priceImpact', dust)).toBe('<0.01%')
  expect(fNum('sharePercent', dust)).toBe('<0.01%')
  expect(fNum('slippage', dust)).toBe('<0.01%')
  expect(fNum('token', dust)).toBe('< 0.00001')
  expect(fNum('weight', dust)).toBe('<0.01%')
})

describe('sum list of bignumbers', () => {
  const identityFn = (n: any) => n

  it('should sum an empty list', () => {
    const result = sum([], identityFn)
    expect(result.isEqualTo(bn(0))).toBe(true)
  })

  it('should sum non empty list', () => {
    const result = sum([bn(1), bn(2)], identityFn)
    expect(result.isEqualTo(bn(3))).toBe(true)
  })

  it('should apply extract function', () => {
    const a = { value: bn(4) }
    const b = { value: bn(5) }

    const result = sum([a, b], x => x.value)

    expect(result.isEqualTo(bn(9))).toBe(true)
  })
})

describe('formatFalsyValueAsDash', () => {
  it('returns dash for undefined and empty string', () => {
    expect(formatFalsyValueAsDash(undefined)).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash('')).toBe(ZERO_VALUE_DASH)
  })

  it('returns formatted value for non-falsy values', () => {
    expect(formatFalsyValueAsDash('100.5')).toBe('100.5')
    expect(formatFalsyValueAsDash(100.5)).toBe('100.5')
  })

  it('respects showZeroAmountAsDash option', () => {
    expect(formatFalsyValueAsDash('0', undefined, { showZeroAmountAsDash: false })).toBe('0')

    expect(formatFalsyValueAsDash('0', undefined, { showZeroAmountAsDash: true })).toBe(
      ZERO_VALUE_DASH
    )

    expect(formatFalsyValueAsDash(0, undefined, { showZeroAmountAsDash: false })).toBe('0')

    expect(formatFalsyValueAsDash(0, undefined, { showZeroAmountAsDash: true })).toBe(
      ZERO_VALUE_DASH
    )
  })

  it('uses formatter when provided', () => {
    const mockFormatter = (value: any) => `$${value}`
    expect(formatFalsyValueAsDash('100', mockFormatter)).toBe('$100')
  })

  it('handles edge cases correctly', () => {
    expect(formatFalsyValueAsDash('')).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash(undefined)).toBe(ZERO_VALUE_DASH)
    expect(formatFalsyValueAsDash('-100')).toBe('-100')
    expect(formatFalsyValueAsDash('0.123456')).toBe('0.123456')
    expect(formatFalsyValueAsDash('1000000000')).toBe('1000000000')
  })
})

describe('isValidNumber', () => {
  test('returns false for nullish and invalid values', () => {
    expect(isValidNumber(null)).toBe(false)
    expect(isValidNumber(undefined)).toBe(false)
    expect(isValidNumber('')).toBe(false)
    expect(isValidNumber('abc')).toBe(false)
    expect(isValidNumber('.')).toBe(false)
    expect(isValidNumber(',')).toBe(false)
    expect(isValidNumber('1,5')).toBe(false)
  })

  test('returns true for valid numbers and numeric strings', () => {
    expect(isValidNumber(0)).toBe(true)
    expect(isValidNumber(1.5)).toBe(true)
    expect(isValidNumber(-10)).toBe(true)
    expect(isValidNumber('0')).toBe(true)
    expect(isValidNumber('1.5')).toBe(true)
    expect(isValidNumber('100')).toBe(true)
    expect(isValidNumber('0.0000000000000035')).toBe(true)
    expect(isValidNumber('0.')).toBe(true)
    expect(isValidNumber('.5')).toBe(true)
  })
})
describe('isGreaterThanZeroValidation', () => {
  test('returns error for whitespace instead of throwing', () => {
    expect(isGreaterThanZeroValidation('  ')).toBe('Amount must be greater than 0')
  })

  test('returns true for values greater than zero', () => {
    expect(isGreaterThanZeroValidation('1')).toBe(true)
    expect(isGreaterThanZeroValidation('0.0001')).toBe(true)
  })

  test('returns error for zero or negative values', () => {
    expect(isGreaterThanZeroValidation('0')).toBe('Amount must be greater than 0')
    expect(isGreaterThanZeroValidation('-1')).toBe('Amount must be greater than 0')
  })
})

describe('isBnParseable', () => {
  test('returns false for nullish and values bn() cannot parse', () => {
    expect(isBnParseable(null)).toBe(false)
    expect(isBnParseable(undefined)).toBe(false)
    expect(isBnParseable('')).toBe(false)
    expect(isBnParseable('.')).toBe(false)
    expect(isBnParseable(',')).toBe(false)
    expect(isBnParseable('1,5')).toBe(false)
    expect(isBnParseable('1.2.3')).toBe(false)
    // Passes isValidNumber (lodash toNumber) but throws in bn() — the reason this guard exists
    expect(isBnParseable('  ')).toBe(false)
  })

  test('returns true for values bn() can parse', () => {
    expect(isBnParseable(0)).toBe(true)
    expect(isBnParseable(1.5)).toBe(true)
    expect(isBnParseable(12345678901234567890n)).toBe(true)
    expect(isBnParseable(bn('1.5'))).toBe(true)
    expect(isBnParseable('0')).toBe(true)
    expect(isBnParseable('1.5')).toBe(true)
    expect(isBnParseable('0.')).toBe(true)
    expect(isBnParseable('.5')).toBe(true)
    expect(isBnParseable('0.0000000000000035')).toBe(true)
  })
})

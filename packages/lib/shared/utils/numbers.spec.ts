import { bn, fNum, safeTokenFormat, BN_LOWER_THRESHOLD } from './numbers'

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

describe('safeTokenFormat', () => {
  test('for a bigint amount', () => {
    expect(safeTokenFormat(251359380787607529n, 18)).toBe('0.2514')
    expect(safeTokenFormat(null, 18)).toBe('-')
  })
})

describe('safeTokenFormat', () => {
  test('for a bigint amount', () => {
    expect(safeTokenFormat(251359380787607529n, 18)).toBe('0.2514')
    expect(safeTokenFormat(null, 18)).toBe('-')
  })
})

describe('bn', () => {
  test('creates a BigNumber instance from different formats', () => {
    expect(bn(1234567).toFixed()).toBe('1234567')
    expect(bn('54321').toFixed()).toBe('54321')
    expect(bn(12345n).toFixed()).toBe('12345')
    expect(bn('0.0000000000000035').toFixed()).toBe('0.0000000000000035')
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

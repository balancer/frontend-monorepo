import { convertHexToLowerCase } from './objects'

describe('updates config objects by lower-casing hexadecimal keys/values', () => {
  test('in values', () => {
    const input = {
      issues: {
        fxPoolVulnWarning: '0xA',
      },
    }
    expect(convertHexToLowerCase(input)).toEqual({
      issues: {
        fxPoolVulnWarning: '0xa',
      },
    })
  })

  test('in arrays', () => {
    const input = {
      issues: {
        fxPoolVulnWarning: ['0xB'],
      },
    }
    expect(convertHexToLowerCase(input)).toEqual({
      issues: {
        fxPoolVulnWarning: ['0xb'],
      },
    })
  })

  test('in keys', () => {
    const input = {
      foo: {
        '0xC': [123],
        '0xD': 123,
      },
    }
    expect(convertHexToLowerCase(input)).toEqual({
      foo: { '0xc': [123], '0xd': 123 },
    })
  })

  test('with deeply nested configs', () => {
    const input = {
      foo: {
        bar: {
          baz: { '0xA': '0xB' },
        },
      },
    }

    expect(convertHexToLowerCase(input)).toEqual({
      foo: {
        bar: {
          baz: { '0xa': '0xb' },
        },
      },
    })
  })
})

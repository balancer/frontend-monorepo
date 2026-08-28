import { describe, expect, it } from 'vitest'
import { usd } from './format'

describe('usd', () => {
  it('formats large values compactly', () => {
    expect(usd(5_400_000_000)).toBe('$5.4B')
  })

  it('formats zero as $0', () => {
    expect(usd(0)).toBe('$0')
  })

  it('formats negative values', () => {
    expect(usd(-1_200_000)).toBe('-$1.2M')
  })
})

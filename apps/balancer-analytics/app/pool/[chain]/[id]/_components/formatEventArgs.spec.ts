import { describe, expect, it } from 'vitest'
import { formatEventArgValue } from './formatEventArgs'

describe('formatEventArgValue', () => {
  it('renders null/undefined as an em dash', () => {
    expect(formatEventArgValue('x', null)).toBe('—')
    expect(formatEventArgValue('x', undefined)).toBe('—')
  })

  it('renders booleans as true/false', () => {
    expect(formatEventArgValue('paused', true)).toBe('true')
    expect(formatEventArgValue('paused', false)).toBe('false')
  })

  it('formats 1e18-scaled percentages as %', () => {
    expect(formatEventArgValue('swapFeePercentage', '100000000000000000')).toBe('10%')
    expect(formatEventArgValue('aggregateSwapFeePercentage', '50000000000000000')).toBe('5%')
  })

  it('formats amp values scaled by 1000 as decimals', () => {
    expect(formatEventArgValue('startValue', '2000')).toBe('2')
    expect(formatEventArgValue('endValue', '5000')).toBe('5')
  })

  it('formats unix-second timestamps as locale dates', () => {
    const out = formatEventArgValue('startTime', '1700000000')
    expect(out).not.toBe('1700000000')
    expect(out).toMatch(/\d{1,2}:\d{2}/)
  })

  it('falls back to String(value) for unknown keys', () => {
    expect(formatEventArgValue('someOther', '123')).toBe('123')
    expect(formatEventArgValue('someOther', 42)).toBe('42')
  })
})

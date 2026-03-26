import { describe, expect, test } from 'vitest'
import { getPoolActivityTitle } from './usePoolActivity'

describe('getPoolActivityTitle', () => {
  test('returns singular labels for a single event', () => {
    expect(getPoolActivityTitle('all', 1)).toBe('transaction')
    expect(getPoolActivityTitle('adds', 1)).toBe('add')
    expect(getPoolActivityTitle('removes', 1)).toBe('remove')
    expect(getPoolActivityTitle('swaps', 1)).toBe('swap')
  })

  test('returns plural labels for multiple events', () => {
    expect(getPoolActivityTitle('all', 2)).toBe('transactions')
    expect(getPoolActivityTitle('adds', 2)).toBe('adds')
    expect(getPoolActivityTitle('removes', 2)).toBe('removes')
    expect(getPoolActivityTitle('swaps', 2)).toBe('swaps')
  })

  test('returns an empty label when there is no active tab', () => {
    expect(getPoolActivityTitle(undefined, 0)).toBe('')
  })
})

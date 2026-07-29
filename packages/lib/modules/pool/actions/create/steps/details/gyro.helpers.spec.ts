import { describe, expect, test } from 'vitest'
import { calculatePeakPrice, calculateRotationComponents } from './gyro.helpers'

describe('E-CLP rotation calculations', () => {
  test('returns empty rotation components for an incomplete peak price', () => {
    expect(calculateRotationComponents('.')).toEqual({ c: '', s: '' })
  })

  test('returns an empty peak price when either rotation component is malformed', () => {
    expect(calculatePeakPrice({ c: '1', s: '.' })).toBe('')
  })
})

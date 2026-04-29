import { describe, expect, it } from 'vitest'
import { getPermit2ApprovalTimestamps } from './usePermit2ApprovalSteps'

describe('getPermit2ApprovalTimestamps', () => {
  it('returns current time and permit expiry in seconds', () => {
    const nowMs = Date.UTC(2026, 0, 1, 12, 0, 0)

    expect(getPermit2ApprovalTimestamps(nowMs)).toEqual({
      nowInSecs: 1767268800,
      permitExpiry: 1767528000,
    })
  })
})

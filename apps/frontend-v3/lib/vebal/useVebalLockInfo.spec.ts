import { getVebalLockState } from './useVebalLockInfo'

describe('getVebalLockState', () => {
  test('marks an existing lock as expired when its end date is in the past', () => {
    const result = getVebalLockState({
      currentTimestampMs: Date.parse('2026-04-24T12:00:00.000Z'),
      lockedAmount: 10n,
      lockedEndDate: 1_777_000_000n,
    })

    expect(result).toMatchObject({
      hasExistingLock: true,
      isExpired: true,
      lockTooShort: false,
    })
  })

  test('marks an active lock as too short when less than a week remains', () => {
    const result = getVebalLockState({
      currentTimestampMs: Date.parse('2026-04-24T12:00:00.000Z'),
      lockedAmount: 10n,
      lockedEndDate: 1_777_435_200n,
    })

    expect(result).toMatchObject({
      hasExistingLock: true,
      isExpired: false,
      lockTooShort: true,
    })
  })

  test('does not mark a user without a lock as expired or too short', () => {
    const result = getVebalLockState({
      currentTimestampMs: Date.parse('2026-04-24T12:00:00.000Z'),
      lockedAmount: 0n,
      lockedEndDate: 0n,
    })

    expect(result).toMatchObject({
      hasExistingLock: false,
      isExpired: false,
      lockTooShort: false,
    })
  })
})

import { describe, expect, test } from 'vitest'
import {
  getAcceptedPolicies,
  getAcceptedPoliciesStorage,
  shouldResetAcceptedPolicies,
} from './accepted-policies-storage'

const acceptedAddress = '0x1234'
const currentPoliciesVersion = 1

describe('accepted policies storage', () => {
  test('resets legacy accepted addresses when versioning is enabled', () => {
    const legacyStorage = [acceptedAddress]

    expect(getAcceptedPolicies(legacyStorage, currentPoliciesVersion)).toEqual([])
    expect(shouldResetAcceptedPolicies(legacyStorage, currentPoliciesVersion)).toBe(true)
  })

  test('retains accepted addresses for the current policy version', () => {
    const currentStorage = {
      version: currentPoliciesVersion,
      acceptedAddresses: [acceptedAddress],
    }

    expect(getAcceptedPolicies(currentStorage, currentPoliciesVersion)).toEqual([acceptedAddress])
    expect(shouldResetAcceptedPolicies(currentStorage, currentPoliciesVersion)).toBe(false)
  })

  test('resets accepted addresses for a stale policy version', () => {
    const staleStorage = {
      version: currentPoliciesVersion - 1,
      acceptedAddresses: [acceptedAddress],
    }

    expect(getAcceptedPolicies(staleStorage, currentPoliciesVersion)).toEqual([])
    expect(shouldResetAcceptedPolicies(staleStorage, currentPoliciesVersion)).toBe(true)
  })

  test('writes accepted addresses with the configured policy version', () => {
    expect(getAcceptedPoliciesStorage([acceptedAddress], currentPoliciesVersion)).toEqual({
      version: currentPoliciesVersion,
      acceptedAddresses: [acceptedAddress],
    })
  })

  test('keeps accepted addresses in the legacy format when versioning is disabled', () => {
    const legacyStorage = [acceptedAddress]

    expect(getAcceptedPolicies(legacyStorage)).toEqual([acceptedAddress])
    expect(shouldResetAcceptedPolicies(legacyStorage)).toBe(false)
    expect(getAcceptedPoliciesStorage([acceptedAddress])).toEqual([acceptedAddress])
  })
})

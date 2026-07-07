type VersionedAcceptedPolicies = {
  version: number
  acceptedAddresses: string[]
}

export type AcceptedPoliciesStorage = string[] | VersionedAcceptedPolicies

function isCurrentPolicies(
  value: unknown,
  currentPoliciesVersion: number
): value is VersionedAcceptedPolicies {
  if (!value || typeof value !== 'object') return false

  const policies = value as Partial<VersionedAcceptedPolicies>

  return (
    policies.version === currentPoliciesVersion &&
    Array.isArray(policies.acceptedAddresses) &&
    policies.acceptedAddresses.every(address => typeof address === 'string')
  )
}

export function getAcceptedPolicies(value: unknown, currentPoliciesVersion?: number): string[] {
  if (currentPoliciesVersion === undefined) return Array.isArray(value) ? value : []

  return isCurrentPolicies(value, currentPoliciesVersion) ? value.acceptedAddresses : []
}

export function shouldResetAcceptedPolicies(
  value: unknown,
  currentPoliciesVersion?: number
): boolean {
  return currentPoliciesVersion !== undefined && !isCurrentPolicies(value, currentPoliciesVersion)
}

export function getAcceptedPoliciesStorage(
  acceptedAddresses: string[],
  currentPoliciesVersion?: number
): AcceptedPoliciesStorage {
  if (currentPoliciesVersion === undefined) return acceptedAddresses

  return {
    version: currentPoliciesVersion,
    acceptedAddresses,
  }
}

export type IsDisabledWithReason = {
  isDisabled: boolean
  disabledReason?: string
}

function disabled(reason: string): IsDisabledWithReason {
  return {
    isDisabled: true,
    disabledReason: reason,
  }
}

/**
 * Iterates over the given conditions and returns the first disabled reason.
 */
export function isDisabledWithReason(
  ...conditionsWithReasons: [boolean, string][]
): IsDisabledWithReason {
  const notDisabled = { isDisabled: false }

  for (const [condition, reason] of conditionsWithReasons) {
    if (condition) return disabled(reason)
  }

  return notDisabled
}

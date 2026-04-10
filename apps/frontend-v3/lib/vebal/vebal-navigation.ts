export const fromManage = 'manage'
export const fromVote = 'vote'

// Used to determine the redirect path after a vebal lock action
export type VeBalSourcePage = 'manage'
export type VeBalAction = 'unlock'

export function getVeBalManagePath(veBalAction: VeBalAction) {
  return `/vebal/manage/${veBalAction}`
}

export function useVeBalRedirectPath() {
  const redirectPath = '/vebal/manage'
  const returnLabel = 'Return to veBAL manage'

  return { redirectPath, returnLabel }
}

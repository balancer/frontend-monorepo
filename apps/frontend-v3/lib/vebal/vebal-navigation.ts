import { useSearchParams } from 'next/navigation'

export const fromManage = 'manage'
export const fromVote = 'vote'

// Used to determine the redirect path after a vebal lock action
type VeBalSourcePage = 'manage' | 'vote'

export function getVeBalManagePath(
  veBalAction: 'lock' | 'unlock' | 'extend',
  sourcePage: VeBalSourcePage
) {
  return `/vebal/manage/${veBalAction}?from=${sourcePage}`
}

export function useVeBalRedirectPath() {
  const searchParams = useSearchParams()
  const from = searchParams.get('from')

  let redirectPath = '/vebal/'
  let returnLabel = 'Return to veBAL page'
  if (from === 'manage') {
    redirectPath = '/vebal/manage'
    returnLabel = 'Return to veBAL manage'
  } else if (from === 'vote') {
    redirectPath = '/vebal/vote'
    returnLabel = 'Return to veBal voting'
  }

  return { redirectPath, returnLabel }
}

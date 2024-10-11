import { useQuery } from '@tanstack/react-query'

import { useUserAccount } from '../../web3/UserAccountProvider'

export interface OmniEscrowLock {
  id: string
  localUser: {
    id: string
  }
  remoteUser: string
  bias: string
  slope: string
  dstChainId: string
}

export interface OmniEscrowLockResponse {
  omniVotingEscrowLocks: OmniEscrowLock[]
}

export function useOmniEscrowLocksQuery() {
  const { userAddress } = useUserAccount()
  const queryKey = ['OmniEscrowLocks', userAddress]

  async function fetchOmniEscrowLocks(): Promise<OmniEscrowLockResponse> {
    return {
      omniVotingEscrowLocks: [],
    }
  }

  const isEnabled = !!userAddress

  return useQuery({
    queryKey,
    queryFn: fetchOmniEscrowLocks,
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  })
}

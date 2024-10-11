import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'

export interface VotingEscrowLock {
  id: string
  slope: string
  bias: string
  timestamp: number
}

export interface VotingEscrowLockResponse {
  votingEscrowLocks: VotingEscrowLock[]
}

export function useVotingEscrowLocksQueries(addresses: string[]) {
  const votingEscrowLocksQueryEnabled = useMemo(() => {
    return addresses.some(Boolean)
  }, [addresses])

  const fetchVotingEscrowLocks = async (): Promise<VotingEscrowLockResponse> => {
    return {
      votingEscrowLocks: [],
    }
  }

  return useQueries({
    queries: addresses.map(address => {
      return {
        queryKey: ['VotingEscrowLocksByNetworkId', address],
        queryFn: fetchVotingEscrowLocks,
        enabled: votingEscrowLocksQueryEnabled,
        refetchOnWindowFocus: false,
      }
    }),
  })
}

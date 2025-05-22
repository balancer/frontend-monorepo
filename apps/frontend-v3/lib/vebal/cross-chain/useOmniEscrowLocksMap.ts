import {
  OmniEscrowLock,
  useOmniEscrowLocksQuery,
} from '@bal/lib/vebal/cross-chain/useOmniEscrowLocksQuery'
import { useMemo } from 'react'
import { Address } from 'viem'

export type OmniEscrowMap = Record<string, OmniEscrowLock>

export function useOmniEscrowLocksMap(userAddress: Address) {
  const {
    data: omniEscrowResponse,
    isLoading: isLoadingOmniEscrow,
    refetch: refetchOmniEscrow,
    // isError: isOmniEscrowError,
  } = useOmniEscrowLocksQuery(userAddress)

  const allNetworksUnsynced = omniEscrowResponse?.omniVotingEscrowLocks.length === 0

  const omniEscrowLocksMap = useMemo(() => {
    if (allNetworksUnsynced || !omniEscrowResponse) return null

    return omniEscrowResponse.omniVotingEscrowLocks.reduce<Record<string, OmniEscrowLock>>(
      (acc, item) => {
        acc[item.dstChainId] = item
        return acc
      },
      {}
    )
  }, [allNetworksUnsynced, omniEscrowResponse])

  return {
    isLoadingOmniEscrow,
    omniEscrowLocksMap,
    // TODO: handle error when we know more about useOmniEscrowLocksQuery implementation
    isOmniEscrowError: false,
    refetchOmniEscrow,
  }
}

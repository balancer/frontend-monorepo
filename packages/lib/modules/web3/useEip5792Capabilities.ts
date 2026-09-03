'use client'

import { useCapabilities } from 'wagmi'
import { useUserAccount } from './UserAccountProvider'

export type AtomicCapabilityStatus = 'supported' | 'ready' | 'unsupported' | undefined

/*
  Detects whether the connected wallet supports EIP-5792 atomic batched calls
  (EIP-7702 capable EOAs). Reads the `atomic` capability scoped to the
  connected address + chain.

  - 'supported'  -> wallet can batch atomically right now
  - 'ready'      -> wallet can batch but needs the user to upgrade (EIP-7702 delegation)
  - 'unsupported'-> wallet has no atomic batching capability
  - undefined    -> capability query still loading or errored (treat as unsupported)
*/
export function useEip5792AtomicCapability(): {
  atomicStatus: AtomicCapabilityStatus
  isLoading: boolean
} {
  const { userAddress, chainId } = useUserAccount()

  const capabilitiesQuery = useCapabilities({
    account: userAddress,
    chainId,
    query: {
      enabled: !!userAddress && !!chainId,
    },
  })

  // When chainId is passed, useCapabilities returns the capabilities object directly.
  // Cast to the atomic shape we care about (the raw type is a union of index signatures).
  const capabilities = capabilitiesQuery.data as
    { atomic?: { status: AtomicCapabilityStatus } } | undefined

  const atomicStatus = capabilities?.atomic?.status

  return { atomicStatus, isLoading: capabilitiesQuery.isLoading }
}

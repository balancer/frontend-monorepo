'use client'

import { Address } from '@balancer/sdk'
import { useBalance } from 'wagmi'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'

export function useUserBalance({ chainId, token }: { chainId: number; token: Address }) {
  const { userAddress } = useUserAccount()
  const { data, isLoading, isError, error } = useBalance({
    chainId,
    address: userAddress,
    token,
  })

  return {
    balanceData: data,
    isLoading,
    isError,
    error,
  }
}

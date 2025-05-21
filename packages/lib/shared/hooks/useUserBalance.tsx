'use client'

import { Address } from '@balancer/sdk'
import { useBalance } from 'wagmi'

export function useUserBalance({
  chainId,
  address,
  token,
}: {
  chainId: number
  address: Address
  token: Address
}) {
  const { data } = useBalance({
    chainId,
    address,
    token,
  })

  return {
    balanceData: data,
  }
}

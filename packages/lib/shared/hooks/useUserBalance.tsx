'use client'

import { Address } from '@balancer/sdk'
import { useReadContracts } from 'wagmi'
import { useUserAccount } from '@repo/lib/modules/web3/UserAccountProvider'
import { erc20Abi } from 'viem'

export function useUserBalance({ chainId, token }: { chainId: number; token: Address }) {
  const { userAddress } = useUserAccount()

  const { data, isLoading, isError, error } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address: token,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      },
      {
        chainId,
        address: token,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        chainId,
        address: token,
        abi: erc20Abi,
        functionName: 'symbol',
      },
    ],
  })

  return {
    balanceData: {
      value: data ? data[0] : 0n,
      decimals: data ? data[1] : 0,
      symbol: data ? data[2] : '',
    },
    isLoading,
    isError,
    error,
  }
}

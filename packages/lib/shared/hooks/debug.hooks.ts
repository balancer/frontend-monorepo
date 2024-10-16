'use client'

// Hooks to be used on debug pages or for general debugging

import { permit2Abi } from '@balancer/sdk'
import { getNetworkConfig, getGqlChain } from '@repo/lib/config/app.config'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type Params = {
  chainId: number
  tokenAddress: Address
  owner: Address
}

export function useDebugPermit2Allowance({ chainId, tokenAddress, owner }: Params) {
  const permit2Address = '0x000000000022D473030F116dDEE9F6B43aC78BA3'
  const balancerRouter = getNetworkConfig(getGqlChain(chainId)).contracts.balancer.router!
  const spender = balancerRouter

  return useReadContract({
    chainId,
    address: permit2Address,
    abi: permit2Abi,
    functionName: 'allowance',
    args: [owner, tokenAddress, spender],
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  })
}

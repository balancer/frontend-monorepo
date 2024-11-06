'use client'

// Hooks to be used on debug pages or for general debugging

import { permit2Abi } from '@balancer/sdk'
import { getGqlChain } from '@repo/lib/config/app.config'
import { permit2Address } from '@repo/lib/modules/tokens/approvals/permit2/permit2.helpers'
import { Address } from 'viem'
import { useReadContract } from 'wagmi'

type Params = {
  chainId: number
  tokenAddress: Address
  owner: Address
  spender: Address
}

export function useDebugPermit2Allowance({ chainId, tokenAddress, owner, spender }: Params) {
  return useReadContract({
    chainId,
    address: permit2Address(getGqlChain(chainId)),
    abi: permit2Abi,
    functionName: 'allowance',
    args: [owner, tokenAddress, spender],
    query: {
      enabled: !!tokenAddress && !!owner,
    },
  })
}

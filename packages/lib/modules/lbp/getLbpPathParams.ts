import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'

type LbpPathParams = {
  chain?: GqlChain
  poolAddress?: Address
}
export function getLbpPathParams(slug?: string[]): LbpPathParams {
  if (!slug || slug.length === 0) {
    return {}
  }

  const [chain, poolAddress] = slug
  return {
    chain: chain as GqlChain | undefined,
    poolAddress: poolAddress as Address | undefined,
  }
}

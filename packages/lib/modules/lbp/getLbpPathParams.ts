import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'

type LbpPathParams = {
  chain?: GqlChain
  saleTokenAmount?: string
  collateralTokenAmount?: string
  poolAddress?: Address
}
export function getLbpPathParams(slug?: string[]): LbpPathParams {
  if (!slug || slug.length === 0) {
    return {}
  }

  const [chain, saleTokenAmount, collateralTokenAmount, poolAddress] = slug
  return {
    chain: chain as GqlChain | undefined,
    poolAddress: poolAddress as Address | undefined,
    saleTokenAmount,
    collateralTokenAmount,
  }
}

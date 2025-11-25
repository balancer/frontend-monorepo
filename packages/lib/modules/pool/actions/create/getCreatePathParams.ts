import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { SupportedPoolTypes } from './types'
import { Address } from 'viem'

export type CreatePathParams = {
  network?: GqlChain
  poolType?: SupportedPoolTypes
  poolAddress?: Address
}

export function getCreatePathParams(slug?: string[]): CreatePathParams {
  if (!slug || slug.length === 0) {
    return {}
  }

  const [network, poolType, poolAddress] = slug
  return {
    network: network as GqlChain | undefined,
    poolType: poolType as SupportedPoolTypes | undefined,
    poolAddress: poolAddress as Address | undefined,
  }
}

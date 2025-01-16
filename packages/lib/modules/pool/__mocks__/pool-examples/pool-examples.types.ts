import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { ProtocolVersion } from '../../pool.types'

export type PoolExample = {
  name?: string
  description?: string
  // Explicit pool prefix to make tests more readable
  poolId: Address
  poolAddress?: Address
  poolChain: GqlChain
  version: ProtocolVersion
}

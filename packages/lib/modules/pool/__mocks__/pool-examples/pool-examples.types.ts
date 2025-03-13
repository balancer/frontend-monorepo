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
  isFrozen?: boolean // Explicitly skip mock update to avoid breaking tests using this frozen pools
  mockName?: string // Some sepolia pools do not have symbol so we define the mock name here
}

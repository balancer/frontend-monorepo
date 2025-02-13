import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'

export type LbpFormStep1 = {
  selectedChain: GqlChain
  launchTokenAddress: Address
}

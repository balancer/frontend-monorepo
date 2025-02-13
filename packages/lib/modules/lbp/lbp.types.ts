import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type LbpFormStep1 = {
  selectedChain: GqlChain
  launchTokenAddress: string
}

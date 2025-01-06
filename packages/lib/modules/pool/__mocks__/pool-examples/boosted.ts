import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolExample } from './flat'

export const v3SepoliaNestedBoosted: PoolExample = {
  description: 'Edge case: V3 Nested Boosted',
  poolId: '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c',
  poolChain: GqlChain.Sepolia,
  version: 2,
}

export const morphoStakeHouse: PoolExample = {
  description: 'Edge case: boosted with custom morpho stuff',
  poolId: '0x5dd88b3aa3143173eb26552923922bdf33f50949',
  poolChain: GqlChain.Mainnet,
  version: 3,
}

export const sDAIBoosted: PoolExample = {
  description:
    'Edge case: BOOSTED with 2 ERC4626 tokens but one of them (sDAI) has isBufferAllowed == false',
  poolId: '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522',
  poolChain: GqlChain.Gnosis,
  version: 3,
}

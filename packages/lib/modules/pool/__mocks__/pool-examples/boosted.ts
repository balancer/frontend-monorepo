import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolExample } from './pool-examples.types'

export const v3SepoliaNestedBoosted: PoolExample = {
  name: 'Bv3-50bbaUSD-50WETH',
  description: 'Edge case: V3 Nested Boosted',
  poolId: '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c',
  poolChain: GqlChain.Sepolia,
  version: 2,
  mockName: 'v3SepoliaNestedBoostedMock',
}

export const usdcUsdtAaveBoosted: PoolExample = {
  name: 'usdcUsdtAaveBoosted',
  description: 'Edge case: V3 100% Boosted (Aave  50% USDC 50% USDT)',
  poolId: '0x89bb794097234e5e930446c0cec0ea66b35d7570',
  poolChain: GqlChain.Mainnet,
  version: 3,
}

export const morphoStakeHouse: PoolExample = {
  name: 'Steakhouse/Coinshift Boosted',
  description: 'Edge case: boosted with custom morpho stuff',
  poolId: '0x5dd88b3aa3143173eb26552923922bdf33f50949',
  poolChain: GqlChain.Mainnet,
  version: 3,
}

export const sDAIBoosted: PoolExample = {
  name: 'aGNO/sDAI',
  description:
    'Edge case: BOOSTED with 2 ERC4626 tokens but one of them (sDAI) has isBufferAllowed == false',
  poolId: '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522',
  poolChain: GqlChain.Gnosis,
  version: 3,
}

export const partialBoosted: PoolExample = {
  name: 'rstETH/LidowstETH',
  description: 'Edge case: BOOSTED with 1 ERC4626 (waEthLidowstETH) and one non ERC4626 (rstETH)',
  poolId: '0x121edb0badc036f5fc610d015ee14093c142313b',
  poolChain: GqlChain.Mainnet,
  version: 3,
}

export const boostedPoolExamples = [
  v3SepoliaNestedBoosted,
  usdcUsdtAaveBoosted,
  morphoStakeHouse,
  sDAIBoosted,
  partialBoosted,
]

import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { PoolExample } from './pool-examples.types'

export const v3SepoliaNestedBoosted: PoolExample = {
  name: 'Bv3-50bbaUSD-50WETH',
  description: 'Edge case: V3 Nested Boosted',
  poolId: '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c',
  poolChain: GqlChainValues.Sepolia,
  version: 2,
  mockName: 'v3SepoliaNestedBoostedMock',
}

export const usdcUsdtAaveBoosted: PoolExample = {
  name: 'Aave USDC-USDT',
  description: 'Edge case: V3 100% Boosted (Aave - 50% USDC 50% USDT)',
  poolId: '0x89bb794097234e5e930446c0cec0ea66b35d7570',
  poolChain: GqlChainValues.Mainnet,
  version: 3,
}

export const usdcGhoUsdtAaveBoosted: PoolExample = {
  name: 'Aave Gho-USDC-USDT',
  description: 'Edge case: V3 100% Boosted (Aave - 33% GHO, 33% USDC, 34% USDT)',
  poolId: '0x85b2b559bc2d21104c4defdd6efca8a20343361d',
  poolChain: GqlChainValues.Mainnet,
  version: 3,
}

export const morphoStakeHouse: PoolExample = {
  name: 'B-csUSDL-steakUSDC',
  description: 'Edge case: boosted with custom morpho stuff',
  poolId: '0x5dd88b3aa3143173eb26552923922bdf33f50949',
  poolChain: GqlChainValues.Mainnet,
  version: 3,
}

export const partialBoosted: PoolExample = {
  name: 'aGNO/sDAI',
  description:
    'Edge case: BOOSTED with 2 ERC4626 tokens but one of them (sDAI) has useUnderlyingForAddRemove == false',
  poolId: '0xd1d7fa8871d84d0e77020fc28b7cd5718c446522',
  poolChain: GqlChainValues.Gnosis,
  version: 3,
  // Freeze pool to avoid breaking useProportionalInput tests
  isFrozen: true,
}

export const boostedCoinshiftUsdcUsdl: PoolExample = {
  name: 'B-csUSDC-csUSDL',
  description: 'Full Boosted csUSDC-csUSDL',
  poolId: '0x10a04efba5b880e169920fd4348527c64fb29d4d',
  poolChain: GqlChainValues.Mainnet,
  version: 3,
  // Freeze pool mock to avoid breaking useAprTooltip and useGetPoolRewards tests
  isFrozen: true,
}

export const stableSurgeBoosted: PoolExample = {
  name: 'Aave USDC-Aave GHO',
  poolId: '0x7ab124ec4029316c2a42f713828ddf2a192b36db',
  description: 'Boosted pool with stable surge pool',
  poolChain: GqlChainValues.Base,
  version: 3,
}

export const anSSiloWSBoosted: PoolExample = {
  name: 'bpt-anS-SiloWS',
  description: 'Edge case: V3 partial boosted stable (anS + SiloWS ERC4626)',
  poolId: '0x944d4ae892de4bfd38742cc8295d6d5164c5593c',
  poolChain: GqlChainValues.Sonic,
  version: 3,
}

export const boostedPoolExamples = [
  v3SepoliaNestedBoosted,
  usdcUsdtAaveBoosted,
  usdcGhoUsdtAaveBoosted,
  morphoStakeHouse,
  partialBoosted,
  boostedCoinshiftUsdcUsdl,
  stableSurgeBoosted,
  usdcGhoUsdtAaveBoosted,
  anSSiloWSBoosted,
]

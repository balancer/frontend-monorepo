import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolExample } from './pool-examples.types'

export const balWeth8020: PoolExample = {
  name: 'B-50BAL-50WETH',
  description: 'Weighted OG',
  poolId: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
  poolAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
  poolChain: GqlChain.Mainnet,
  version: 2,
}
export const osETHPhantom: PoolExample = {
  name: 'osETH/wETH-BPT',
  description:
    'Edge case: Phantom composable stable where the pool itself appears in one of the tokens',
  poolId: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
  poolChain: GqlChain.Mainnet,
  version: 2,
}

export const sDAIWeighted: PoolExample = {
  name: 'B-50sDAI-50wstETH',
  description: 'Edge case: sDAI is ERC4626 but has isBufferAllowed is FALSE',
  poolId: '0xbc2acf5e821c5c9f8667a36bb1131dad26ed64f9000200000000000000000063',
  poolChain: GqlChain.Gnosis,
  version: 2,
}

export const v2SepoliaStableWithERC4626: PoolExample = {
  name: 'Sepolia dai-aave usdc-aave not boosted',
  description: 'It has ERC4626 (usdc-aave and dai-aave) tokens but it is V2 so it is not boosted',
  poolId: '0x6c3966874f49a2f6a8f2f791f82f65b214e90ccb0000000000000000000001a6',
  poolChain: GqlChain.Sepolia,
  version: 2,
  mockName: 'v2SepoliaStableWithERC4626Mock',
}

export const cowAmmPoolWethGno: PoolExample = {
  name: 'BCoW-50WETH-50GNO',
  description: 'CoW AMM pool',
  poolId: '0x079d2094e16210c42457438195042898a3cff72d',
  poolChain: GqlChain.Gnosis,
  version: 1,
}

export const v3StableNonBoosted: PoolExample = {
  name: 'rsETH-hgETH',
  description: 'v3 stable non-boosted',
  poolId: '0x6649a010cbcf5742e7a13a657df358556b3e55cf',
  poolChain: GqlChain.Mainnet,
  version: 3,
}

export const flatPoolExamples = [
  balWeth8020,
  osETHPhantom,
  sDAIWeighted,
  v2SepoliaStableWithERC4626,
  cowAmmPoolWethGno,
  v3StableNonBoosted,
]

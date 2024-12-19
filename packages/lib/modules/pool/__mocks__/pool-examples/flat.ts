import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { ProtocolVersion } from '../../pool.types'

export type PoolExample = {
  description?: string
  // Explicit pool prefix to make tests more readable
  poolId: Address
  poolAddress?: Address
  poolChain: GqlChain
  version: ProtocolVersion
}

export const balWeth8020: PoolExample = {
  description: 'Weighted OG',
  poolId: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
  poolAddress: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
  poolChain: GqlChain.Mainnet,
  version: 2,
}

export const osETHPhantom: PoolExample = {
  description:
    'Edge case: Phantom composable stable where the pool itself appears in one of the tokens',
  poolId: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
  poolChain: GqlChain.Mainnet,
  version: 2,
}

// TODO: use it in actionable tests
// THIS is A WRONG TEST CAUSE IT IS V2, we need V3
export const sDAIWeighted: PoolExample = {
  description: 'Edge case: sDAI is ERC4626 but has isBufferAllowed == false',
  poolId: '0xbc2acf5e821c5c9f8667a36bb1131dad26ed64f9000200000000000000000063',
  poolChain: GqlChain.Gnosis,
  version: 2,
}

export const v2SepoliaStableWithERC4626: PoolExample = {
  description: 'It has ERC4626 (usdc-aave and dai-aave) tokens but it is V2 so it is not boosted',
  poolId: '0x6c3966874f49a2f6a8f2f791f82f65b214e90ccb0000000000000000000001a6',
  poolChain: GqlChain.Sepolia,
  version: 3,
}

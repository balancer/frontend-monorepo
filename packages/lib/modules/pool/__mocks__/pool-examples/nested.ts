import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolExample } from './flat'

export const staBALv2Nested: PoolExample = {
  description: 'V2 Nested supporting nested actions (default)',
  poolId: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
  poolChain: GqlChain.Gnosis,
  version: 2,
}

export const auraBal: PoolExample = {
  description: 'Edge case: Must use nested 8020 BPT to add (does not support nested actions)',
  poolId: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
  poolChain: GqlChain.Mainnet,
  version: 2,
}

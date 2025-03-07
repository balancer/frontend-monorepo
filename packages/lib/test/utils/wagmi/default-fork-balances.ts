import { HumanAmount } from '@balancer/sdk'
import { Address } from 'viem'
import { base } from 'viem/chains'

export type TokenBalance = {
  tokenAddress: Address
  decimals?: number
  value: HumanAmount
}

export type ChainTokenBalance = TokenBalance & {
  chainId: number
}

export type TokenBalancesByChain = Record<number, TokenBalance[]>

const baseTokenBalances: TokenBalance[] = [
  {
    tokenAddress: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', // USDC
    value: '5000',
    decimals: 6,
  },
  {
    tokenAddress: '0x6bb7a212910682dcfdbd5bcbb3e28fb4e8da10ee', // GHO
    value: '3000',
    decimals: 6,
  },
]

export const defaultForkBalances: TokenBalancesByChain = {
  [base.id]: baseTokenBalances,
}

import { HumanAmount } from '@balancer/sdk'
import { Address } from 'viem'
import { base, gnosis, mainnet, sonic } from 'viem/chains'
import {
  baseTokenBalances,
  gnosisTokenBalances,
  mainnetTokenBalances,
  sonicTokenBalances,
} from './fork-default-balances'

export type TokenBalance = {
  tokenAddress: Address
  decimals?: number
  value: HumanAmount
}

export type ChainTokenBalance = TokenBalance & {
  chainId: number
}

export type TokenBalancesByChain = Record<number, TokenBalance[]>

export type ForkOptions = {
  chainId: number
  forkBalances: TokenBalancesByChain
}
declare global {
  interface Window {
    forkOptions?: ForkOptions
  }
}

const defaultForkBalances: TokenBalancesByChain = {
  [mainnet.id]: mainnetTokenBalances,
  [base.id]: baseTokenBalances,
  [gnosis.id]: gnosisTokenBalances,
  [sonic.id]: sonicTokenBalances,
}

export const defaultManualForkOptions = {
  chainId: mainnet.id, // Change this id for manual tests on different chains
  forkBalances: defaultForkBalances,
}

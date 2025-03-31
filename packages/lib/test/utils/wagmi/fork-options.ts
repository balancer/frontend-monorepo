import { HumanAmount } from '@balancer/sdk'
import { Address } from 'viem'
import { base, gnosis, mainnet, polygon, sonic } from 'viem/chains'
import {
  baseTokenBalances,
  gnosisTokenBalances,
  mainnetTokenBalances,
  polygonTokenBalances,
  sonicTokenBalances,
} from './fork-default-balances'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

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
  [polygon.id]: polygonTokenBalances,
}

const isBeets = PROJECT_CONFIG.projectId === 'beets'
export const defaultManualForkOptions = {
  chainId: isBeets ? sonic.id : mainnet.id, // Change this id for manual tests on different chains
  forkBalances: defaultForkBalances,
}

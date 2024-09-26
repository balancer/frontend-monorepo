import { GqlPoolUserBalance } from '@repo/api/graphql'

export function aUserPoolBalance(...options: Partial<GqlPoolUserBalance>[]): GqlPoolUserBalance {
  const defaultBalance: GqlPoolUserBalance = {
    __typename: 'GqlPoolUserBalance',
    totalBalance: '100',
    totalBalanceUsd: 100,
    walletBalance: '100',
    walletBalanceUsd: 100,
    stakedBalances: [],
  }

  return Object.assign({}, defaultBalance, ...options)
}

import type { GqlPoolUserBalance } from '@repo/lib/shared/services/api/graphql-derived-types'

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

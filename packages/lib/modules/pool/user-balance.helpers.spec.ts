import { aWjAuraWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import {
  GqlPoolStakingType,
  GqlPoolUserBalance,
  GqlUserStakedBalance,
} from '@repo/lib/shared/services/api/generated/graphql'
import {
  calcNonOnChainFetchedStakedBalance,
  calcTotalStakedBalanceInt,
  getUserTotalBalanceInt,
  getUserWalletBalanceInt,
  calcTotalStakedBalance,
  calcTotalStakedBalanceUsd,
  getUserTotalBalance,
  getUserTotalBalanceUsd,
  getUserWalletBalance,
  getUserWalletBalanceUsd,
  hasStakedBalanceFor,
  hasBalancerStakedBalance,
  hasTinyBalance,
} from './user-balance.helpers'

const apiStakedBalances: GqlUserStakedBalance[] = [
  {
    balance: '0',
    balanceUsd: 0,
    stakingType: GqlPoolStakingType.Gauge,
    stakingId: '0xe99a452a65e5bb316febac5de83a1ca59f6a3a94', //Preferential gauge
    __typename: 'GqlUserStakedBalance',
  },
  {
    balance: '52.123',
    balanceUsd: 7.9,
    stakingType: GqlPoolStakingType.Gauge,
    stakingId: '0x55ec14e951b1c25ab09132dae12363bea0d20105', //Non preferential gauge
    __typename: 'GqlUserStakedBalance',
  },
]

test('User balance helpers', () => {
  const pool = aWjAuraWethPoolElementMock()
  const userBalanceMock: GqlPoolUserBalance = {
    __typename: 'GqlPoolUserBalance',
    walletBalance: '100',
    walletBalanceUsd: 200,
    totalBalance: '175',
    totalBalanceUsd: 300,
    stakedBalances: apiStakedBalances,
  }
  pool.userBalance = userBalanceMock

  expect(getUserTotalBalance(pool)).toBe('175.000000000000000000')
  expect(getUserTotalBalanceUsd(pool)).toBe(300)
  expect(getUserTotalBalanceInt(pool)).toBe(175000000000000000000n)

  expect(calcTotalStakedBalance(pool)).toBe('52.123')
  expect(calcTotalStakedBalanceUsd(pool)).toBe(7.9)
  expect(calcTotalStakedBalanceInt(pool)).toBe(52123000000000000000n)

  expect(getUserWalletBalance(pool)).toBe('100')
  expect(getUserWalletBalanceUsd(pool)).toBe(200)
  expect(getUserWalletBalanceInt(pool)).toBe(100000000000000000000n)

  expect(calcNonOnChainFetchedStakedBalance(pool)).toBe('0')

  expect(hasBalancerStakedBalance(pool)).toBeTruthy()
  expect(hasStakedBalanceFor(pool, GqlPoolStakingType.FreshBeets)).toBeFalsy()
  expect(hasTinyBalance(pool)).toBeFalsy()
})

test('has tiny balance', () => {
  const pool = aWjAuraWethPoolElementMock()
  const userBalanceMock: GqlPoolUserBalance = {
    __typename: 'GqlPoolUserBalance',
    walletBalance: '0.1',
    walletBalanceUsd: 0,
    totalBalance: '0.12345',
    totalBalanceUsd: 0.0009,
    stakedBalances: [],
  }
  pool.userBalance = userBalanceMock
  expect(hasTinyBalance(pool)).toBeTruthy()
})

describe('invalid balance fallbacks', () => {
  test('getUserTotalBalance returns 0 when totalBalance is invalid', () => {
    const pool = aWjAuraWethPoolElementMock()
    pool.userBalance = {
      __typename: 'GqlPoolUserBalance',
      walletBalance: '100',
      walletBalanceUsd: 200,
      totalBalance: '',
      totalBalanceUsd: 300,
      stakedBalances: [],
    }
    expect(getUserTotalBalance(pool)).toBe('0')
  })

  test('getUserTotalBalanceInt returns 0n when totalBalance is invalid', () => {
    const pool = aWjAuraWethPoolElementMock()
    pool.userBalance = {
      __typename: 'GqlPoolUserBalance',
      walletBalance: '100',
      walletBalanceUsd: 200,
      totalBalance: null as any,
      totalBalanceUsd: 300,
      stakedBalances: [],
    }
    expect(getUserTotalBalanceInt(pool)).toBe(0n)
  })

  test('calcStakedBalance handles invalid staked balances', () => {
    const pool = aWjAuraWethPoolElementMock()
    pool.userBalance = {
      __typename: 'GqlPoolUserBalance',
      walletBalance: '100',
      walletBalanceUsd: 200,
      totalBalance: '175',
      totalBalanceUsd: 300,
      stakedBalances: [
        {
          balance: '',
          balanceUsd: 0,
          stakingType: GqlPoolStakingType.Gauge,
          stakingId: '0x1',
          __typename: 'GqlUserStakedBalance',
        },
        {
          balance: '52.123',
          balanceUsd: 7.9,
          stakingType: GqlPoolStakingType.Gauge,
          stakingId: '0x2',
          __typename: 'GqlUserStakedBalance',
        },
      ],
    }
    expect(calcTotalStakedBalance(pool)).toBe('52.123')
    expect(calcTotalStakedBalanceUsd(pool)).toBe(7.9)
  })

  test('handles scientific notation from API balances', () => {
    const pool = aWjAuraWethPoolElementMock()
    pool.userBalance = {
      __typename: 'GqlPoolUserBalance',
      walletBalance: '6.1713167421e-8',
      walletBalanceUsd: 0,
      totalBalance: '6.1713167421e-8',
      totalBalanceUsd: 0,
      stakedBalances: [
        {
          balance: '6.1713167421e-8',
          balanceUsd: 0,
          stakingType: GqlPoolStakingType.Gauge,
          stakingId: '0x1',
          __typename: 'GqlUserStakedBalance',
        },
      ],
    }
    expect(getUserWalletBalanceInt(pool)).toBe(61713167421n)
    expect(getUserTotalBalanceInt(pool)).toBe(61713167421n)
    expect(calcTotalStakedBalanceInt(pool)).toBe(61713167421n)
  })
})

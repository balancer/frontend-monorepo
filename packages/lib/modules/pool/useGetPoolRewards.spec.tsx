import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { boostedCoinshiftUsdcUsdl } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { Pool } from './pool.types'
import { useGetPoolRewards } from './useGetPoolRewards'
import { GqlPoolStakingGaugeReward } from '@repo/lib/shared/services/api/generated/graphql'

function getPoolWithStakingGaugeRewards() {
  const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  // Add fixed rewards to avoid breaking tests if the pool mock is updated
  pool.staking.gauge.rewards = [
    {
      id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
      rewardPerSecond: '0.000518908841708722',
      tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
    } as GqlPoolStakingGaugeReward,
  ]
  return pool
}

function getPoolWithMultipleStakingGaugeRewards() {
  const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  // Add multiple fixed rewards to test weeklyRewardsByToken with round numbers
  pool.staking.gauge.rewards = [
    {
      id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
      rewardPerSecond: '0.0001', // Exactly 0.0001 tokens per second
      tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d', // BAL
    } as GqlPoolStakingGaugeReward,
    {
      id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0x6b175474e89094c44da98b954eedeac495271d0f-daigauge',
      rewardPerSecond: '0.001', // Exactly 0.001 tokens per second
      tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    } as GqlPoolStakingGaugeReward,
    {
      id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0x0000000000000000000000000000000000000000-zerogauge',
      rewardPerSecond: '0',
      tokenAddress: '0x0000000000000000000000000000000000000000', // Zero rewards
    } as GqlPoolStakingGaugeReward,
  ]
  return pool
}

function testUseGetPoolRewards(pool: Pool) {
  const { result } = testHook(() => useGetPoolRewards(pool))
  return result
}

describe('useGetPoolRewards', () => {
  test('when pool has BAL rewards', () => {
    const pool = getPoolWithStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    expect(result.current.tokens).toMatchObject([
      {
        address: '0xba100000625a3754423978a60c9317c58a424e3d',
        chainId: 1,
        decimals: 18,
        name: 'Balancer',
        symbol: 'BAL',
      },
    ])

    expect(result.current.weeklyRewards).toBe(627.6721349308702)
  })

  test('calculates potential weekly yield when', () => {
    const pool = getPoolWithStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    // When totalUsdValueIn is small enough
    const totalUsdValueIn = '100'
    expect(result.current.calculatePotentialYield(totalUsdValueIn)).toBe('0.27144610061178742084')

    // When totalUsdValueIn is so large that calcPotentialYieldFor is bigger than total usd value of weeklyRewards
    expect(result.current.calculatePotentialYield(10000000)).toBe('627.6721349308702')
    expect(result.current.calculatePotentialYield(100000000)).toBe('627.6721349308702')
    expect(result.current.calculatePotentialYield(1000000000)).toBe('627.6721349308702')
  })

  test('calculates weeklyRewardsByToken correctly', () => {
    const pool = getPoolWithMultipleStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    // Check that weeklyRewardsByToken contains the expected token addresses
    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(
      '0xba100000625a3754423978a60c9317c58a424e3d'
    )
    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(
      '0x6b175474e89094c44da98b954eedeac495271d0f'
    )
    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(
      '0x0000000000000000000000000000000000000000'
    )

    // Check that the weekly reward amounts are calculated correctly
    // BAL: 0.0001 * 60 * 60 * 24 * 7 = 60.48 tokens per week
    const balRewards = parseFloat(
      result.current.weeklyRewardsByToken['0xba100000625a3754423978a60c9317c58a424e3d']
    )
    expect(balRewards).toBeCloseTo(60.48, 2)

    // DAI: 0.001 * 60 * 60 * 24 * 7 = 604.8 tokens per week
    const daiRewards = parseFloat(
      result.current.weeklyRewardsByToken['0x6b175474e89094c44da98b954eedeac495271d0f']
    )
    expect(daiRewards).toBeCloseTo(604.8, 2)

    // Zero rewards token should have '0'
    expect(result.current.weeklyRewardsByToken['0x0000000000000000000000000000000000000000']).toBe(
      '0'
    )
  })
})

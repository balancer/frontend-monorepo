import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { Pool } from './pool.types'
import { useGetPoolRewards } from './useGetPoolRewards'
import type { GqlPoolStakingGaugeReward } from '@repo/lib/shared/services/api/graphql-derived-types'
import { waitFor } from '@testing-library/react'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

function getPoolWithStakingGaugeRewards() {
  const pool = getApiPoolMock(anSSiloWSBoosted)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  pool.staking.gauge.rewards = [
    {
      id: `${pool.staking.gauge.gaugeAddress}-${sonicTokens.sts}-reward`,
      rewardPerSecond: '0.000518908841708722',
      tokenAddress: sonicTokens.sts,
    } as GqlPoolStakingGaugeReward,
  ]

  return pool
}

function getPoolWithMultipleStakingGaugeRewards() {
  const pool = getApiPoolMock(anSSiloWSBoosted)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  // Add multiple fixed rewards to test weeklyRewardsByToken with round numbers
  pool.staking.gauge.rewards = [
    {
      id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0xe5da20f15420ad15de0fa650600afc998bbe3955-balgauge',
      rewardPerSecond: '0.0001', // Exactly 0.0001 tokens per second
      tokenAddress: '0xe5da20f15420ad15de0fa650600afc998bbe3955', // stS
    } as GqlPoolStakingGaugeReward,
    {
      id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38-daigauge',
      rewardPerSecond: '0.001', // Exactly 0.001 tokens per second
      tokenAddress: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38', // wS
    } as GqlPoolStakingGaugeReward,
    {
      id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0x0000000000000000000000000000000000000000-zerogauge',
      rewardPerSecond: '0',
      tokenAddress: '0x0000000000000000000000000000000000000000', // Zero rewards
    } as GqlPoolStakingGaugeReward,
  ]

  return pool
}

function getPoolWithInvalidStakingGaugeRewards() {
  const pool = getApiPoolMock(anSSiloWSBoosted)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  pool.staking.gauge.rewards = [
    {
      id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0xe5da20f15420ad15de0fa650600afc998bbe3955-balgauge',
      rewardPerSecond: ' ' as any,
      tokenAddress: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
    } as GqlPoolStakingGaugeReward,
    {
      id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38-daigauge',
      rewardPerSecond: '0.001',
      tokenAddress: '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
    } as GqlPoolStakingGaugeReward,
  ]

  return pool
}

function testUseGetPoolRewards(pool: Pool) {
  const { result } = testHook(() => useGetPoolRewards(pool))
  return result
}

describe('useGetPoolRewards', () => {
  test('when pool has stS rewards', async () => {
    const pool = getPoolWithStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.tokens).toMatchObject([
      {
        address: sonicTokens.sts,
        chainId: 146,
        decimals: 18,
        name: 'Beets Staked Sonic',
        symbol: 'stS',
      },
    ])

    expect(result.current.weeklyRewards).toBe(627.6721349308701)
  })

  test('calculates potential weekly yield when', async () => {
    const pool = getPoolWithStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // When totalUsdValueIn is small enough
    const totalUsdValueIn = '100'
    expect(result.current.calculatePotentialYield(totalUsdValueIn)).toBe('0.01187707122179705192')

    // When totalUsdValueIn is so large that calcPotentialYieldFor is bigger than total usd value of weeklyRewards
    expect(result.current.calculatePotentialYield(10000000)).toBe('627.6721349308701')
    expect(result.current.calculatePotentialYield(100000000)).toBe('627.6721349308701')
    expect(result.current.calculatePotentialYield(1000000000)).toBe('627.6721349308701')
  })

  test('calculates weeklyRewardsByToken correctly', async () => {
    const pool = getPoolWithMultipleStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Check that weeklyRewardsByToken contains the expected token addresses
    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(sonicTokens.sts)

    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(sonicTokens.ws)

    expect(Object.keys(result.current.weeklyRewardsByToken)).toContain(
      '0x0000000000000000000000000000000000000000'
    )

    // Check that the weekly reward amounts are calculated correctly
    // stS: 0.0001 * 60 * 60 * 24 * 7 = 60.48 tokens per week
    expect(result.current.weeklyRewardsByToken[sonicTokens.sts]).toBe('60.48')

    // wS: 0.001 * 60 * 60 * 24 * 7 = 604.8 tokens per week
    expect(result.current.weeklyRewardsByToken[sonicTokens.ws]).toBe('604.8')

    // Zero rewards token should have '0'
    expect(result.current.weeklyRewardsByToken['0x0000000000000000000000000000000000000000']).toBe(
      '0'
    )
  })

  test('handles invalid rewardPerSecond gracefully', async () => {
    const pool = getPoolWithInvalidStakingGaugeRewards()
    const result = testUseGetPoolRewards(pool)

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Invalid rewardPerSecond should fallback to '0'
    expect(result.current.weeklyRewardsByToken[sonicTokens.sts]).toBe('0')

    // Valid rewardPerSecond should still calculate correctly
    expect(result.current.weeklyRewardsByToken[sonicTokens.ws]).toBe('604.8')
  })
})

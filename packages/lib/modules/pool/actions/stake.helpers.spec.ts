import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'
import { boostedCoinshiftUsdcUsdl } from '../__mocks__/pool-examples/boosted'
import type { GqlPoolStakingGaugeReward } from '../../../shared/services/api/generated/graphql-derived-types'
import { getCanStake } from './stake.helpers'

describe('stake.helpers', () => {
  describe('getCanStake', () => {
    function getPoolWithRewards(rewards: GqlPoolStakingGaugeReward[]) {
      const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)
      if (!pool.staking?.gauge) throw new Error('Pool should have staking gauge')
      pool.staking.gauge.rewards = rewards
      return pool
    }

    test('returns false when rewards array is empty', () => {
      const pool = getPoolWithRewards([])
      expect(getCanStake(pool)).toBe(false)
    })

    test('returns false when all rewards have rewardPerSecond === "0"', () => {
      const pool = getPoolWithRewards([
        {
          id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
          rewardPerSecond: '0',
          tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
        } as GqlPoolStakingGaugeReward,
      ])
      expect(getCanStake(pool)).toBe(false)
    })

    test('returns true when at least one reward has rewardPerSecond !== "0"', () => {
      const pool = getPoolWithRewards([
        {
          id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
          rewardPerSecond: '0.000518908841708722',
          tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
        } as GqlPoolStakingGaugeReward,
      ])
      expect(getCanStake(pool)).toBe(true)
    })

    test('returns true when mixed zero and non-zero rewards exist', () => {
      const pool = getPoolWithRewards([
        {
          id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
          rewardPerSecond: '0.0001',
          tokenAddress: '0xba100000625a3754423978a60c9317c58a424e3d',
        } as GqlPoolStakingGaugeReward,
        {
          id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0x0000000000000000000000000000000000000000-zerogauge',
          rewardPerSecond: '0',
          tokenAddress: '0x0000000000000000000000000000000000000000',
        } as GqlPoolStakingGaugeReward,
      ])
      expect(getCanStake(pool)).toBe(true)
    })

    test('returns false when pool has no staking', () => {
      const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)
      delete (pool as any).staking
      expect(getCanStake(pool)).toBe(false)
    })
  })
})

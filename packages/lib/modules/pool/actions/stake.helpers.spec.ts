import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '../__mocks__/pool-examples/boosted'
import type { GqlPoolStakingGaugeReward } from '../../../shared/services/api/graphql-derived-types'
import { getCanStake } from './stake.helpers'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

describe('stake.helpers', () => {
  describe('getCanStake', () => {
    function getPoolWithRewards(rewards: GqlPoolStakingGaugeReward[]) {
      const pool = getApiPoolMock(anSSiloWSBoosted)
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
          id: `0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-${sonicTokens.sts}-reward`,
          rewardPerSecond: '0',
          tokenAddress: sonicTokens.sts,
        } as GqlPoolStakingGaugeReward,
      ])

      expect(getCanStake(pool)).toBe(false)
    })

    test('returns true when at least one reward has rewardPerSecond !== "0"', () => {
      const pool = getPoolWithRewards([
        {
          id: `0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-${sonicTokens.sts}-reward`,
          rewardPerSecond: '0.000518908841708722',
          tokenAddress: sonicTokens.sts,
        } as GqlPoolStakingGaugeReward,
      ])

      expect(getCanStake(pool)).toBe(true)
    })

    test('returns true when mixed zero and non-zero rewards exist', () => {
      const pool = getPoolWithRewards([
        {
          id: `0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-${sonicTokens.sts}-reward`,
          rewardPerSecond: '0.0001',
          tokenAddress: sonicTokens.sts,
        } as GqlPoolStakingGaugeReward,
        {
          id: '0x27aaf70334cc564bcedfe0cca43cf3dadc850bea-0x0000000000000000000000000000000000000000-reward',
          rewardPerSecond: '0',
          tokenAddress: '0x0000000000000000000000000000000000000000',
        } as GqlPoolStakingGaugeReward,
      ])

      expect(getCanStake(pool)).toBe(true)
    })

    test('returns false when pool has no staking', () => {
      const pool = getApiPoolMock(anSSiloWSBoosted)
      delete (pool as any).staking
      expect(getCanStake(pool)).toBe(false)
    })
  })
})

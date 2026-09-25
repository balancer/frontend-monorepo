import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import type { GqlPoolStakingGaugeReward } from '@repo/lib/shared/services/api/graphql-derived-types'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { GetUserPoolRewardsParams, useGetUserPoolRewards } from './useGetUserPoolRewards'
import { BalTokenReward } from '../portfolio/PortfolioClaim/useBalRewards'
import { formatUnits } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { BPT_DECIMALS } from './pool.constants'
import {} from '@repo/lib/debug-helpers'
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

function testUseGetUserPoolRewards(params: GetUserPoolRewardsParams) {
  const { result } = testHook(() => useGetUserPoolRewards(params))
  return result
}

describe('useGetPoolRewards', () => {
  test('when pool has stS rewards', () => {
    const pool = getPoolWithStakingGaugeRewards()

    const rewardsMock: BalTokenReward[] = [
      {
        gaugeAddress: '0x1',
        balance: 1500000000000000000n,
        decimals: BPT_DECIMALS,
        fiatBalance: bn(formatUnits(1500000000000000000n, BPT_DECIMALS)),
        humanBalance: '1.5',
        tokenAddress: sonicTokens.sts,
        pool: pool,
      },
    ]

    const result = testUseGetUserPoolRewards({
      pool,
      balRewards: rewardsMock,
      nonBalRewards: [],
    })

    expect(result.current.rewardsByToken).toEqual({
      [sonicTokens.sts]: '1.5',
    })
  })
})

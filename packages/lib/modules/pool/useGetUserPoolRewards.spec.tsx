import { getApiPoolMock } from '@repo/lib/modules/pool/__mocks__/api-mocks/api-mocks'
import { boostedCoinshiftUsdcUsdl } from '@repo/lib/modules/pool/__mocks__/pool-examples/boosted'
import { GqlPoolStakingGaugeReward } from '@repo/lib/shared/services/api/generated/graphql'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { GetUserPoolRewardsParams, useGetUserPoolRewards } from './useGetUserPoolRewards'
import { BalTokenReward } from '../portfolio/PortfolioClaim/useBalRewards'
import { formatUnits } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { BPT_DECIMALS } from './pool.constants'
import { balAddress } from '@repo/lib/debug-helpers'

function getPoolWithStakingGaugeRewards() {
  const pool = getApiPoolMock(boostedCoinshiftUsdcUsdl)
  if (!pool.staking?.gauge?.rewards) throw new Error('Pool should have staking gauge rewards')

  // Add fixed rewards to avoid breaking tests if the pool mock is updated
  pool.staking.gauge.rewards = [
    {
      id: '0x5bbaed1fadc08c5fb3e4ae3c8848777e2da77103-0xba100000625a3754423978a60c9317c58a424e3d-balgauge',
      rewardPerSecond: '0.000518908841708722',
      tokenAddress: balAddress,
    } as GqlPoolStakingGaugeReward,
  ]
  return pool
}

function testUseGetUserPoolRewards(params: GetUserPoolRewardsParams) {
  const { result } = testHook(() => useGetUserPoolRewards(params))
  return result
}

describe('useGetPoolRewards', () => {
  test('when pool has BAL rewards', () => {
    const pool = getPoolWithStakingGaugeRewards()

    const balRewardsMock: BalTokenReward[] = [
      {
        gaugeAddress: '0x1',
        balance: 1500000000000000000n,
        decimals: BPT_DECIMALS,
        fiatBalance: bn(formatUnits(1500000000000000000n, BPT_DECIMALS)),
        humanBalance: '1.5',
        tokenAddress: balAddress,
        pool: pool,
      },
    ]

    const result = testUseGetUserPoolRewards({
      pool,
      balRewards: balRewardsMock,
      nonBalRewards: [],
    })

    expect(result.current.rewardsByToken).toEqual({
      [balAddress]: '1.5',
    })
  })
})

import { GqlChain, GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { userStakedInNonPreferentialGauge } from '@/test/anvil/anvil-setup'
import { testHook } from '@/test/utils/custom-renderers'
import { connectWith, disconnectWith } from '@/test/utils/wagmi/wagmi-connections'
import { waitFor } from '@testing-library/react'
import { getPoolMock } from '../__mocks__/getPoolMock'
import { useUserStakedBalance } from './useUserStakedBalance'

async function testUseChainPoolBalances(pool: GqlPoolElement) {
  const { result } = testHook(() => {
    return useUserStakedBalance([pool])
  })

  return result
}

/*
  This hook is also tested as part of useOnchainUserPoolBalance.integration.spec.ts but we keep these tests
  to better understand/maintain the behavior of the hook
*/
describe('fetches onchain user balances', async () => {
  test('when the user is staked in a non-preferential gauge', async () => {
    const userStakedInNonPreferentialGauge = '0xF01Cc7154e255D20489E091a5aEA10Bc136696a8'
    await connectWith(userStakedInNonPreferentialGauge)
    const poolId = '0x1b65fe4881800b91d4277ba738b567cbb200a60d0002000000000000000002cc' // Pool with user staked in non preferential gauge
    const pool = await getPoolMock(poolId, GqlChain.Mainnet, userStakedInNonPreferentialGauge)

    const result = await testUseChainPoolBalances(pool)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    // Returns gauge staked balances by pool id
    const gaugeStakedBalances = result.current.stakedBalancesByPoolId[poolId]
    expect(gaugeStakedBalances).toMatchObject([
      {
        balance: '0',
        balanceUsd: 0,
        stakingType: 'GAUGE',
        stakingId: '0x7dfadb8c3230890a81dc9593110b63bc088740d4', //Preferential gauge
      },
      {
        balance: '132.059815272199034366',
        balanceUsd: expect.any(Number),
        stakingType: 'GAUGE',
        stakingId: '0xb0fb3e031224bd449974ab02cae369e81db58fa6', //Non preferential gauge
      },
    ])

    await disconnectWith(userStakedInNonPreferentialGauge)
  })

  test('when the pool does not have staking info', async () => {
    const poolId = '0x05f21bacc4fd8590d1eaca9830a64b66a733316c00000000000000000000087e' // Pool with only preferential gauge
    const holder = userStakedInNonPreferentialGauge
    const pool = await getPoolMock(poolId, GqlChain.Polygon, holder)
    pool.staking = null

    const result = await testUseChainPoolBalances(pool)

    await waitFor(() => expect(result.current.isLoading).toBeFalsy())

    expect(result.current.stakedBalancesByPoolId).toEqual({
      '0x05f21bacc4fd8590d1eaca9830a64b66a733316c00000000000000000000087e': [],
    })
  })
})

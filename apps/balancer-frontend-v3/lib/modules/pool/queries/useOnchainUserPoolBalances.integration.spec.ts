import { getSdkTestUtils } from '@/test/integration/sdk-utils'
import {
  aBalWethPoolElementMock,
  toGqlWeighedPoolMock,
} from '@/test/msw/builders/gqlPoolElement.builders'
import { testHook } from '@/test/utils/custom-renderers'
import { mainnetTestPublicClient } from '@/test/utils/wagmi/wagmi-test-clients'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { ChainId } from '@balancer/sdk'
import { waitFor } from '@testing-library/react'
import { useOnchainUserPoolBalances } from './useOnchainUserPoolBalances'
import { GqlPoolElement } from '@/lib/shared/services/api/generated/graphql'
import { connectWithDefaultUser } from '@/test/utils/wagmi/wagmi-connections'

async function testUseChainPoolBalances(pool: GqlPoolElement) {
  const weightedPoolMock = toGqlWeighedPoolMock(pool)
  const { result } = testHook(() => {
    return useOnchainUserPoolBalances([weightedPoolMock])
  })

  return result
}

async function createSdkUtils(pool: GqlPoolElement) {
  return getSdkTestUtils({
    account: defaultTestUserAccount,
    chainId: ChainId.MAINNET,
    client: mainnetTestPublicClient,
    pool,
  })
}

await connectWithDefaultUser()

describe('fetches onchain and overrides user balances', async () => {
  test('when the user has wallet balance', async () => {
    const poolMock = aBalWethPoolElementMock() // Provides 80BAL-20WETH pool by default
    const utils = await createSdkUtils(poolMock)

    // sets pool wallet balance
    await utils.setUserPoolBalance('40')

    const result = await testUseChainPoolBalances(poolMock)

    await waitFor(() => expect(result.current.data[0].userBalance?.walletBalance).toBe('40'))
  })

  test('when the pool does not have staking info', async () => {
    const poolMockWithUndefinedStaking = aBalWethPoolElementMock() // Provides 80BAL-20WETH pool by default
    poolMockWithUndefinedStaking.staking = undefined

    expect(poolMockWithUndefinedStaking.staking).toBeUndefined()

    const utils = await createSdkUtils(poolMockWithUndefinedStaking)

    // sets pool wallet balance
    await utils.setUserPoolBalance('50')

    const result = await testUseChainPoolBalances(poolMockWithUndefinedStaking)

    await waitFor(() => expect(result.current.isFetching).toBeFalsy())

    expect(result.current.data[0].userBalance?.walletBalance).toBe('50')
  })

  test('when the pool has no gaugeAddress', async () => {
    const poolMockWithEmptyGaugeAddress = aBalWethPoolElementMock() // Provides 80BAL-20WETH pool by default
    // Empty staking address
    if (poolMockWithEmptyGaugeAddress.staking?.gauge?.gaugeAddress) {
      poolMockWithEmptyGaugeAddress.staking.gauge.gaugeAddress = ''
    }

    expect(poolMockWithEmptyGaugeAddress.staking?.gauge).toMatchInlineSnapshot(`
    {
      "__typename": "GqlPoolStakingGauge",
      "gaugeAddress": "",
      "id": "0x2d42910d826e5500579d121596e98a6eb33c0a1b",
      "rewards": [],
      "status": "ACTIVE",
      "version": 2,
      "workingSupply": "",
    }
  `)

    const utils = await createSdkUtils(poolMockWithEmptyGaugeAddress)

    // sets pool wallet balance
    await utils.setUserPoolBalance('60')

    const result = await testUseChainPoolBalances(poolMockWithEmptyGaugeAddress)

    await waitFor(() => expect(result.current.isFetching).toBeFalsy())
    expect(result.current.data[0].userBalance?.walletBalance).toBe('60')
  })

  // TODO: Fix test, extremely flaky
  // test('@slow: when the pool user is staked in a non-preferential gauge (polygon)', async () => {
  //   const holder = '0xE0Dd0C6a3F0A34c5175b65Bbd227710d9A5E09c8'
  //   await connectWith(holder)
  //   const poolId = '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66' // Pool with user staked in non preferential gauge
  //   const pool = await getPoolMock(poolId, GqlChain.Polygon, holder)

  //   const result = await testUseChainPoolBalances(pool)

  //   await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  //   expect(result.current.data[0].userBalance).toMatchObject({
  //     stakedBalances: [
  //       {
  //         __typename: 'GqlUserStakedBalance',
  //         balance: '52.364668984347889717',
  //         balanceUsd: 0,
  //         poolId: '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66',
  //         stakingId: '0x55ec14e951b1c25ab09132dae12363bea0d20105',
  //         stakingType: 'GAUGE',
  //       },
  //       {
  //         __typename: 'GqlUserStakedBalance',
  //         balance: '0',
  //         balanceUsd: 0,
  //         poolId: '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66',
  //         stakingId: '0x2cd2b37e574b73e103eb61116afc51463f254f02',
  //         stakingType: 'AURA',
  //       },
  //       {
  //         __typename: 'GqlUserStakedBalance',
  //         balance: '0',
  //         balanceUsd: 0,
  //         poolId: '0xeab6455f8a99390b941a33bbdaf615abdf93455e000200000000000000000a66',
  //         stakingId: '0xe99a452a65e5bb316febac5de83a1ca59f6a3a94',
  //         stakingType: 'GAUGE',
  //       },
  //     ],
  //     totalBalance: '52.364668984347889717',
  //     totalBalanceUsd: expect.any(Number),
  //     walletBalance: '0',
  //     walletBalanceUsd: 0,
  //   })
  // })
})

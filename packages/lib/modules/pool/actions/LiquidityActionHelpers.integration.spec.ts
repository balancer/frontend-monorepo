/* eslint-disable max-len */
import {
  balAddress,
  bpt3PoolAddress,
  daiAddress,
  usdcAddress,
  usdtAddress,
  wETHAddress,
} from '@repo/lib/debug-helpers'
import { HumanTokenAmountWithAddress } from '@repo/lib/modules/tokens/token.types'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { getPoolMock } from '../__mocks__/getPoolMock'
import { allPoolTokens } from '../pool.helpers'
import { LiquidityActionHelpers } from './LiquidityActionHelpers'

describe('Calculates toInputAmounts from allPoolTokens', () => {
  it('for v2 weighted pool with no nested tokens', async () => {
    const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014' // 80BAL-20WETH

    const pool = await getPoolMock(poolId, GqlChain.Mainnet)

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: balAddress },
    ]

    expect(allPoolTokens(pool).map(t => t.address)).toEqual([balAddress, wETHAddress])

    const helpers = new LiquidityActionHelpers(pool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: balAddress,
        decimals: 18,
        rawAmount: 100000000000000000000n,
      },
    ])
  })

  it('for v2 pool with nested BPTs', async () => {
    // Balancer 50WETH-50-3pool
    const poolId = '0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0'
    const nestedPool = await getPoolMock(poolId, GqlChain.Mainnet)
    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '100', tokenAddress: daiAddress },
    ]

    expect(allPoolTokens(nestedPool).map(t => t.address)).toEqual([
      daiAddress,
      bpt3PoolAddress,
      usdcAddress,
      usdtAddress,
      wETHAddress,
    ])

    const helpers = new LiquidityActionHelpers(nestedPool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toMatchInlineSnapshot(`
      [
        {
          "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
          "decimals": 18,
          "rawAmount": 100000000000000000000n,
        },
      ]
    `)
  })

  // Unskip when sepolia V3 pools are available in production api
  it.skip('for v3 BOOSTED pool', async () => {
    const poolId = '0x6dbdd7a36d900083a5b86a55583d90021e9f33e8' // Sepolia stataEthUSDC stataEthUSDT

    const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8'
    const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0'
    const v3Pool = await getPoolMock(poolId, GqlChain.Sepolia)

    expect(
      allPoolTokens(v3Pool)
        .map(t => t.address)
        .sort()
    ).toMatchInlineSnapshot([usdcSepoliaAddress, usdtSepoliaAddress])

    const humanAmountsIn: HumanTokenAmountWithAddress[] = [
      { humanAmount: '0.1', tokenAddress: usdcSepoliaAddress },
    ]
    const helpers = new LiquidityActionHelpers(v3Pool)

    expect(helpers.toInputAmounts(humanAmountsIn)).toEqual([
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        rawAmount: 100000n,
      },
    ])
  })
})

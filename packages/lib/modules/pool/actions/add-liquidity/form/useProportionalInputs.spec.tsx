import {
  HumanAmount,
  mapPoolType,
  PoolStateWithBalances,
  PoolStateWithUnderlyingBalances,
} from '@balancer/sdk'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { bn } from '@repo/lib/shared/utils/numbers'
import { Address, Hex } from 'viem'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '../../../__mocks__/pool-examples/boosted'
import { isBoosted } from '../../../pool.helpers'
import { Pool, ProtocolVersion } from '../../../pool.types'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { _calculateProportionalHumanAmountsIn } from './useProportionalInputs'

const pool = getApiPoolMock(anSSiloWSBoosted)
const helpers = new LiquidityActionHelpers(pool)

function apiToken(address: string): ApiToken {
  return { address } as ApiToken
}

const wrappedSonicAddress = '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38' // underlying
const siloWsAddress = '0x016c306e103fbf48ec24810d078c65ad13c5f11b' // wrapped

const anSAddress = '0x0c4e186eae8acaa7f7de1315d5ad174be39ec987' // non boosted token

describe('_calculateProportionalHumanAmountsIn', () => {
  it('when reference is first token: underlying wS', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(wrappedSonicAddress),
      humanAmount: '5',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [true, false],
    })

    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: wrappedSonicAddress,
        humanAmount: '5',
      },
      {
        tokenAddress: anSAddress,
        humanAmount: '0.009554310547792584',
      },
    ])
  })

  it('when reference is first token: wrapped SiloWS', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(siloWsAddress),
      humanAmount: '5',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [false, false],
    })

    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: siloWsAddress,
        humanAmount: '5',
      },
      {
        tokenAddress: anSAddress,
        humanAmount: '0.009554310547792584',
      },
    ])
  })

  it('when reference is second token (non-boosted anS) and the first token is in "underlying mode"', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(anSAddress),
      humanAmount: '50',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [true, false],
    })

    // Sorts the results moving anS human amount to the first position
    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: anSAddress,
        humanAmount: '50',
      },
      {
        tokenAddress: wrappedSonicAddress,
        humanAmount: '26166.199931181512589915',
      },
    ])
  })

  it('when reference is second token (non-boosted anS) and the first token is in "wrapped mode"', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(anSAddress),
      humanAmount: '50',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [false, false],
    })

    // Sorts the results moving anS human amount to the first position
    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: anSAddress,
        humanAmount: '50',
      },
      {
        tokenAddress: siloWsAddress,
        humanAmount: '26166.199931181512589915',
      },
    ])
  })
})

// Mocks the pool state with balances that we get from usePoolStateWithBalancesQuery
function mockPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
  return isBoosted(pool)
    ? getMockedBoostedPoolStateWithBalancesV3(pool)
    : getMockedPoolStateWithBalances(pool) // TODO: add tests cases for non boosted pools and fix this helper based on SDK implementation
}

function getMockedPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
  return {
    id: pool.id as Hex,
    address: pool.address as Address,
    type: mapPoolType(pool.type),
    tokens: pool.poolTokens.map(t => ({
      index: t.index,
      address: t.address as Address,
      balance: t.balance as HumanAmount,
      decimals: t.decimals,
    })),
    totalShares: pool.dynamicData.totalShares as HumanAmount,
    protocolVersion: pool.protocolVersion as ProtocolVersion,
  }
}

function getMockedBoostedPoolStateWithBalancesV3(pool: Pool): PoolStateWithUnderlyingBalances {
  const sortedTokens = [...pool.poolTokens].sort((a, b) => a.index - b.index)
  return {
    ...helpers.poolState,
    tokens: sortedTokens.map(token => ({
      ...token,
      /* For the mock, we simply use the wrapped token balance for the underlying token balance
          but when using usePoolStateWithBalancesQuery, the SDK would calculate proper underlying balance
          by using previewRedeem to get the erc4626 unwrapRate
          Context:
          https://github.com/balancer/b-sdk/blob/3554d0cb2dee7450c29f014269778c750ddcdd26/src/entities/utils/getPoolStateWithBalancesV3.ts#L111
      */
      balance: bn(token.balance).toFixed() as HumanAmount,
      underlyingToken:
        token.underlyingToken === null
          ? null
          : {
              ...token.underlyingToken,
              // We use the same balance for the wrapped token balance above
              balance: bn(token.balance).toFixed() as HumanAmount,
            },
    })),
    totalShares: pool.dynamicData.totalShares as HumanAmount,
  } as PoolStateWithUnderlyingBalances
}

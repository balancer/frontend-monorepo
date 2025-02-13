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
import { partialBoosted } from '../../../__mocks__/pool-examples/boosted'
import { isBoosted } from '../../../pool.helpers'
import { Pool, ProtocolVersion } from '../../../pool.types'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { _calculateProportionalHumanAmountsIn } from './useProportionalInputs'

const pool = getApiPoolMock(partialBoosted)
const helpers = new LiquidityActionHelpers(pool)

function apiToken(address: string): ApiToken {
  return { address } as ApiToken
}

const gnoTokenAddress = '0x9c58bacc331c9aa871afd802db6379a98e80cedb' // underlying
const waGnoGNOTokenAddress = '0x7c16f0185a26db0ae7a9377f23bc18ea7ce5d644' // wrapped

const sDaiAddress = '0xaf204776c7245bf4147c2612bf6e5972ee483701' // non boosted token

describe('_calculateProportionalHumanAmountsIn', () => {
  it('when reference is first token: underlying GNO', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(gnoTokenAddress),
      humanAmount: '5',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [true, false],
    })

    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: gnoTokenAddress,
        humanAmount: '5',
      },
      {
        tokenAddress: sDaiAddress,
        humanAmount: '1064.897928989574485893',
      },
    ])
  })

  it('when reference is first token: wrapped waGnoGNO', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(waGnoGNOTokenAddress),
      humanAmount: '5',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [false, false],
    })

    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: waGnoGNOTokenAddress,
        humanAmount: '5',
      },
      {
        tokenAddress: sDaiAddress,
        humanAmount: '1064.897928989574485893',
      },
    ])
  })

  it('when reference is second token (no boosted sDAI) and the first token is in "underlying mode"', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(sDaiAddress),
      humanAmount: '50',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [true, false],
    })

    // Sorts the results moving sDAI human amount to the first position
    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: sDaiAddress,
        humanAmount: '50',
      },
      {
        tokenAddress: gnoTokenAddress,
        humanAmount: '0.23476428415745785',
      },
    ])
  })

  it('when reference is second token (no boosted sDAI) and the first token is in "wrapped mode"', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(sDaiAddress),
      humanAmount: '50',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
      wrapUnderlying: [false, false],
    })

    // Sorts the results moving sDAI human amount to the first position
    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: sDaiAddress,
        humanAmount: '50',
      },
      {
        tokenAddress: waGnoGNOTokenAddress,
        humanAmount: '0.23476428415745785',
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

import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { LiquidityActionHelpers } from '../../LiquidityActionHelpers'
import { _calculateProportionalHumanAmountsIn } from './useProportionalInputs'
import {
  HumanAmount,
  mapPoolType,
  PoolStateWithBalances,
  PoolTokenWithBalance,
} from '@balancer/sdk'
import { Pool, ProtocolVersion } from '../../../pool.types'
import { isBoosted } from '../../../pool.helpers'
import { Address, Hex } from 'viem'
import { bn } from '@repo/lib/shared/utils/numbers'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { partialBoosted } from '../../../__mocks__/pool-examples/boosted'
import { rstEthAddress, wstEthAddress } from '@repo/lib/debug-helpers'

const pool = getApiPoolMock(partialBoosted)
const helpers = new LiquidityActionHelpers(pool)

function apiToken(address: string): ApiToken {
  return { address } as ApiToken
}

describe('calculates and sorts proportional human amounts in', () => {
  it('given a new human amount for the first token (wstEth)', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(wstEthAddress),
      humanAmount: '5',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
    })

    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: wstEthAddress,
        humanAmount: '5',
      },
      {
        tokenAddress: rstEthAddress,
        humanAmount: '5.02111263920180991',
      },
    ])
  })

  it('given a new human amount for the second token (rstEth)', () => {
    const humanAmountsIn = _calculateProportionalHumanAmountsIn({
      token: apiToken(rstEthAddress),
      humanAmount: '50',
      helpers,
      wethIsEth: false,
      poolStateWithBalances: mockPoolStateWithBalances(helpers.pool),
    })

    // Sorts the results moving rstEthAddress human amount to the first position
    expect(humanAmountsIn).toMatchObject([
      {
        tokenAddress: rstEthAddress,
        humanAmount: '50',
      },
      {
        tokenAddress: wstEthAddress,
        humanAmount: '49.789761346549217016',
      },
    ])
  })
})

// Mocks the pool state with balances that we get from usePoolStateWithBalancesQuery
function mockPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
  return isBoosted(pool) ? toBoostedPoolStateWithBalances(pool) : toPoolStateWithBalances(pool)
}

function toPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
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

function toBoostedPoolStateWithBalances(pool: Pool): PoolStateWithBalances {
  const underlyingTokensWithBalance: PoolTokenWithBalance[] = pool.poolTokens.map((token, index) =>
    token.underlyingToken && token.isBufferAllowed
      ? {
          address: token.underlyingToken?.address as Address,
          decimals: token.underlyingToken?.decimals as number,
          index,
          /* For the mock, we simply use the wrapped token balance for the underlying token balance
          but when using usePoolStateWithBalancesQuery, the SDK would calculate proper underlying balance
          by using previewRedeem to get the erc4626 unwrapRate
          Context:
          https://github.com/balancer/b-sdk/blob/3554d0cb2dee7450c29f014269778c750ddcdd26/src/entities/utils/getPoolStateWithBalancesV3.ts#L111
          */
          balance: bn(token.balance).toFixed() as HumanAmount,
        }
      : {
          address: token.address as Address,
          decimals: token.decimals as number,
          balance: token.balance as HumanAmount,
          index,
        }
  )
  const state: PoolStateWithBalances = {
    id: pool.id as Hex,
    address: pool.address as Address,
    protocolVersion: 3,
    type: mapPoolType(pool.type),
    tokens: underlyingTokensWithBalance,
    totalShares: pool.dynamicData.totalShares as HumanAmount,
  }
  return state
}

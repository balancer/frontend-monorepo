/* eslint-disable max-len */
import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { isSameAddress } from '@/lib/shared/utils/addresses'
import { Pool } from './PoolProvider'
import { getPoolTokens } from './pool.helpers'

describe('getPoolTokens', () => {
  it('when pool supports nested actions', () => {
    const pool = {
      id: '0x66888e4f35063ad8bb11506a6fde5024fb4f1db0000100000000000000000053',
      address: '0x2086f52651837600180de173b09470f54ef74910',
      chain: 'GNOSIS',
      poolTokens: [
        {
          address: '0x2086f52651837600180de173b09470f54ef74910',
          symbol: 'staBAL3',
          hasNestedPool: true,
          nestedPool: {
            address: '0x2086f52651837600180de173b09470f54ef74910',
            symbol: 'staBAL3',
            tokens: [
              {
                address: '0x2086f52651837600180de173b09470f54ef74910',
                symbol: 'staBAL3',
              },
              {
                address: '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
                symbol: 'USDT',
              },
              {
                address: '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
                symbol: 'USDC',
              },
              {
                address: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
                symbol: 'WXDAI',
              },
            ],
          },
        },
        {
          address: '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
          symbol: 'WETH',
          hasNestedPool: false,
          nestedPool: null,
        },
        {
          address: '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
          symbol: 'WBTC',
          hasNestedPool: false,
          nestedPool: null,
        },
      ],
    } as unknown as Pool

    const result = getPoolTokens(pool, getTokenMock(pool))
    expect(result.map(t => t.symbol)).toEqual(['USDT', 'USDC', 'WXDAI', 'WETH', 'WBTC']) // contains 'staBAL3' nested tokens (USDT, USDC, WXDAI)
  })

  it('when pool does not support nested actions', () => {
    const pool = {
      id: '0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635',
      address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
      chain: 'MAINNET',
      poolTokens: [
        {
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
          symbol: 'WETH',
          hasNestedPool: false,
          nestedPool: null,
        },
        {
          address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
          symbol: 'osETH/wETH-BPT',
          hasNestedPool: true,
          nestedPool: {
            address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
            symbol: 'osETH/wETH-BPT',
            tokens: [
              {
                address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                symbol: 'WETH',
              },
              {
                address: '0xdacf5fa19b1f720111609043ac67a9818262850c',
                symbol: 'osETH/wETH-BPT',
              },
              {
                address: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
                symbol: 'osETH',
              },
            ],
          },
        },
        {
          address: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
          symbol: 'osETH',
          hasNestedPool: false,
          nestedPool: null,
        },
      ],
    } as unknown as Pool

    const result = getPoolTokens(pool, getTokenMock(pool))
    expect(result.map(t => t.symbol)).toEqual(['WETH', 'osETH']) // excludes 'osETH/wETH-BPT' bpt token
  })
})

function getTokenMock(pool: Pool) {
  const getAllTokens = (pool: Pool): GqlToken[] => {
    const tokens: GqlToken[] = []

    pool.poolTokens.forEach(poolToken => {
      tokens.push({ address: poolToken.address, symbol: poolToken.symbol } as unknown as GqlToken)

      if (poolToken.hasNestedPool && poolToken.nestedPool) {
        poolToken.nestedPool.tokens.forEach(nestedToken => {
          tokens.push(nestedToken as unknown as GqlToken)
        })
      }
    })

    return tokens
  }
  // Returns a getToken mock function that looks for a token by address in the whole pool structure (including nested pools)
  return function (address: string): GqlToken | undefined {
    return getAllTokens(pool).find(token =>
      isSameAddress(token.address, address)
    ) as unknown as GqlToken
  }
}

/* eslint-disable max-len */
import { Pool } from './PoolProvider'
import { supportsNestedActions } from './actions/LiquidityActionHelpers'
import { getPoolActionableTokens } from './pool.helpers'

describe('getPoolActionableTokens', () => {
  it('when nested pool supports nested actions (default behavior)', () => {
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

    const result = getPoolActionableTokens(pool)
    expect(result.map(t => t.symbol)).toEqual(['USDT', 'USDC', 'WXDAI', 'WETH', 'WBTC']) // contains 'staBAL3' nested tokens (USDT, USDC, WXDAI)
  })
})

it('supportsNestedActions', () => {
  const pool = {
    id: '0x12345',
  } as unknown as Pool

  expect(supportsNestedActions(pool)).toBeFalsy()

  expect(
    supportsNestedActions(
      // WETH / osETH Phantom composable stable
      fakeNestedPool('0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635')
    )
  ).toBeTruthy()

  expect(
    supportsNestedActions(
      // Balancer 80 BAL 20 WETH auraBAL',
      fakeNestedPool('0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249')
    )
  ).toBeFalsy()
})

function fakeNestedPool(poolId: string): Pool {
  return {
    id: poolId, // Balancer 80 BAL 20 WETH auraBAL',
    poolTokens: [
      {
        hasNestedPool: true,
      },
    ],
  } as unknown as Pool
}

import { NestedPoolState, PoolGetPool, mapPoolToNestedPoolStateV2 } from '@balancer/sdk'
import { daiAddress, usdcAddress, usdtAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { nestedPoolMock } from '@repo/lib/modules/pool/__mocks__/nestedPoolMock'

test('getPoolMock creates a proper nested pool mock (nestedPoolMock)', () => {
  const nestedPoolState: NestedPoolState = mapPoolToNestedPoolStateV2(
    nestedPoolMock as unknown as PoolGetPool
  )

  expect(nestedPoolState.pools).toMatchInlineSnapshot(`
    [
      {
        "address": "0x08775ccb6674d6bdceb0797c364c2653ed84f384",
        "id": "0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0",
        "level": 1,
        "tokens": [
          {
            "address": "0x79c58f70905f734641735bc61e45c19dd9ad60bc",
            "decimals": 18,
            "index": 0,
            "underlyingToken": null,
          },
          {
            "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
            "decimals": 18,
            "index": 1,
            "underlyingToken": null,
          },
        ],
        "type": "Weighted",
      },
      {
        "address": "0x79c58f70905f734641735bc61e45c19dd9ad60bc",
        "id": "0x79c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e7",
        "level": 0,
        "tokens": [
          {
            "address": "0x6b175474e89094c44da98b954eedeac495271d0f",
            "decimals": 18,
            "index": 0,
            "underlyingToken": null,
          },
          {
            "address": "0x79c58f70905f734641735bc61e45c19dd9ad60bc",
            "decimals": 18,
            "index": 1,
            "underlyingToken": null,
          },
          {
            "address": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
            "decimals": 6,
            "index": 2,
            "underlyingToken": null,
          },
          {
            "address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
            "decimals": 6,
            "index": 3,
            "underlyingToken": null,
          },
        ],
        "type": "ComposableStable",
      },
    ]
  `)

  expect(nestedPoolState.mainTokens.sort().map(t => t.address)).toEqual([
    wETHAddress,
    daiAddress,
    usdcAddress,
    usdtAddress,
  ])
})

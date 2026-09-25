import { daiAddress, usdcAddress, usdtAddress, wETHAddress } from '@repo/lib/debug-helpers'
import type { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'
import {
  DefaultAddLiquidityTestProvider,
  buildDefaultPoolTestProvider,
  testHook,
} from '@repo/lib/test/utils/custom-renderers'
import { AddLiquidityHandler } from './handlers/AddLiquidity.handler'
import { PropsWithChildren } from 'react'
import { useAddLiquidityLogic } from './AddLiquidityProvider'
import { nestedPoolMock } from '../../__mocks__/nestedPoolMock'
import {} from '@repo/lib/test/msw/builders/gqlPoolElement.builders'
import { getApiPoolMock } from '../../__mocks__/api-mocks/api-mocks'
import { scUsdStS } from '../../__mocks__/pool-examples/flat'
const sonicPoolMock = getApiPoolMock(scUsdStS) as unknown as GqlPoolElement

async function testUseAddLiquidity(pool: GqlPoolElement = sonicPoolMock) {
  const PoolProvider = buildDefaultPoolTestProvider(pool)

  function Providers({ children }: PropsWithChildren) {
    return (
      <PoolProvider>
        <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
      </PoolProvider>
    )
  }

  const { result } = testHook(() => useAddLiquidityLogic(), {
    wrapper: Providers,
  })

  return result
}

test('returns amountsIn with empty input amount by default', async () => {
  const result = await testUseAddLiquidity()

  expect(result.current.humanAmountsIn).toEqual([
    {
      tokenAddress: '0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae',
      humanAmount: '',
    },
    {
      tokenAddress: '0xe5da20f15420ad15de0fa650600afc998bbe3955',
      humanAmount: '',
    },
  ])
})

test('uses custom add liquidity handler selector and forwards handler to custom steps hook', async () => {
  const pool = sonicPoolMock
  const PoolProvider = buildDefaultPoolTestProvider(pool)

  const customHandler: AddLiquidityHandler = {
    simulate: vi.fn(),
    getPriceImpact: vi.fn(),
    buildCallData: vi.fn(),
  }

  const addLiquidityHandlerSelector = vi.fn(() => customHandler)
  const useAddLiquiditySteps = vi.fn(() => ({ steps: [], isLoadingSteps: false }))

  function Providers({ children }: PropsWithChildren) {
    return (
      <PoolProvider>
        <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
      </PoolProvider>
    )
  }

  const { result } = testHook(
    () => useAddLiquidityLogic(undefined, addLiquidityHandlerSelector, useAddLiquiditySteps),
    {
      wrapper: Providers,
    }
  )

  expect(result.current.handler).toBe(customHandler)
  expect(addLiquidityHandlerSelector).toHaveBeenCalledWith(pool, false, [false, false])

  expect(useAddLiquiditySteps).toHaveBeenCalledWith(
    expect.objectContaining({
      handler: customHandler,
    })
  )
})

// TODO: Drop this Balancer-only nested pool case or add a Beets/Sonic nested fixture.
test.skip('returns valid tokens for a nested pool', async () => {
  const result = await testUseAddLiquidity(nestedPoolMock as GqlPoolElement)

  const validAddresses = result.current.validTokens.map(t => t.address)

  expect(validAddresses).toEqual(
    expect.arrayContaining([wETHAddress, daiAddress, usdtAddress, usdcAddress])
  )

  expect(validAddresses).toHaveLength(4)
})

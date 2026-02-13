import {
  balAddress,
  daiAddress,
  usdcAddress,
  usdtAddress,
  wETHAddress,
} from '@repo/lib/debug-helpers'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import {
  DefaultAddLiquidityTestProvider,
  buildDefaultPoolTestProvider,
  testHook,
} from '@repo/lib/test/utils/custom-renderers'
import { AddLiquidityHandler } from './handlers/AddLiquidity.handler'
import { PropsWithChildren } from 'react'
import { useAddLiquidityLogic } from './AddLiquidityProvider'
import { nestedPoolMock } from '../../__mocks__/nestedPoolMock'
import { aBalWethPoolElementMock } from '@repo/lib/test/msw/builders/gqlPoolElement.builders'

async function testUseAddLiquidity(pool: GqlPoolElement = aBalWethPoolElementMock()) {
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
      tokenAddress: balAddress,
      humanAmount: '',
    },
    {
      tokenAddress: wETHAddress,
      humanAmount: '',
    },
  ])
})

test('uses custom add liquidity handler selector and forwards handler to custom steps hook', async () => {
  const pool = aBalWethPoolElementMock()
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
  expect(addLiquidityHandlerSelector).toHaveBeenCalledWith(pool, expect.any(Boolean))
  expect(useAddLiquiditySteps).toHaveBeenCalledWith(
    expect.objectContaining({
      handler: customHandler,
    })
  )
})

// Only works when using .only
// there's a global state collision otherwise (investigation pending)
test.skip('returns valid tokens for a nested pool', async () => {
  const result = await testUseAddLiquidity(nestedPoolMock as GqlPoolElement)

  expect(result.current.validTokens.map(t => t.address)).toEqual([
    wETHAddress,
    daiAddress,
    usdtAddress,
    usdcAddress,
  ])
})

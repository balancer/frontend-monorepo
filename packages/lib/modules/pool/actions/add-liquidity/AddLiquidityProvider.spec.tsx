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

test('returns valid tokens for a nested pool', async () => {
  const result = await testUseAddLiquidity(nestedPoolMock as GqlPoolElement)

  const validAddresses = result.current.validTokens.map(t => t.address)
  expect(validAddresses).toEqual(
    expect.arrayContaining([wETHAddress, daiAddress, usdtAddress, usdcAddress])
  )
  expect(validAddresses).toHaveLength(4)
})

import { PropsWithChildren } from 'react'
import { _useAddLiquidity } from './AddLiquidityProvider'
import { nestedPoolMock } from '../../__mocks__/nestedPoolMock'
import {
  balAddress,
  wETHAddress,
  daiAddress,
  usdtAddress,
  usdcAddress,
} from '../../../../debug-helpers'
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { aBalWethPoolElementMock } from '../../../../test/msw/builders/gqlPoolElement.builders'
import {
  buildDefaultPoolTestProvider,
  DefaultAddLiquidityTestProvider,
  testHook,
} from '../../../../test/utils/custom-renderers'

async function testUseAddLiquidity(pool: GqlPoolElement = aBalWethPoolElementMock()) {
  const PoolProvider = buildDefaultPoolTestProvider(pool)

  const Providers = ({ children }: PropsWithChildren) => (
    <PoolProvider>
      <DefaultAddLiquidityTestProvider>{children}</DefaultAddLiquidityTestProvider>
    </PoolProvider>
  )
  const { result } = testHook(() => _useAddLiquidity(), {
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

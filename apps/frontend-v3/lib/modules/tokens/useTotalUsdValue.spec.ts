import { balAddress, wETHAddress } from '@/lib/debug-helpers'
import { fakeTokenBySymbol } from '@/test/data/all-gql-tokens.fake'
import { testHook } from '@/test/utils/custom-renderers'
import { act } from '@testing-library/react'
import { useTotalUsdValue } from './useTotalUsdValue'
import { mockTokenPricesList } from '@/test/msw/handlers/Tokens.handlers'
import { aTokenPriceMock } from '@/lib/modules/tokens/__mocks__/token.builders'
import { HumanTokenAmountWithAddress } from './token.types'
import { actSleep } from '@/lib/shared/utils/sleep'

const balPrice = 2
const wethPrice = 3
mockTokenPricesList([
  aTokenPriceMock({ address: balAddress, price: balPrice }),
  aTokenPriceMock({ address: wETHAddress, price: wethPrice }),
])

test('calculates total USD for human amounts in', async () => {
  const tokens = [fakeTokenBySymbol('BAL'), fakeTokenBySymbol('WETH')]

  const { result } = testHook(() => {
    return useTotalUsdValue(tokens)
  })

  const humanAmountsIn: HumanTokenAmountWithAddress[] = [
    { tokenAddress: balAddress, humanAmount: '100' },
    { tokenAddress: wETHAddress, humanAmount: '50' },
  ]

  //Wait for price mocks to be loaded
  await actSleep(10)

  const totalUsd = await act(async () => {
    return result.current.usdValueFor(humanAmountsIn)
  })

  // balTotal + wethTotal = (100 x 2) + (50 x 3) = 350
  expect(totalUsd).toBe('350')
})

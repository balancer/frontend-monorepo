import { fakeTokenBySymbol } from '@repo/lib/test/data/all-gql-tokens.fake'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'
import { actSleep, testHook } from '@repo/lib/test/utils/custom-renderers'
import { act } from '@testing-library/react'
import { useTotalUsdValue } from './useTotalUsdValue'
import { mockTokenPricesList } from '@repo/lib/test/msw/handlers/Tokens.handlers'
import { aTokenPriceMock } from '@repo/lib/modules/tokens/__mocks__/token.builders'
import { HumanTokenAmountWithSymbol } from './token.types'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'

const stSPrice = 2
const wsPrice = 3

mockTokenPricesList([
  aTokenPriceMock({ address: sonicTokens.sts, chain: GqlChainValues.Sonic, price: stSPrice }),
  aTokenPriceMock({ address: sonicTokens.ws, chain: GqlChainValues.Sonic, price: wsPrice }),
])

test('calculates total USD for human amounts in', async () => {
  const tokens = [fakeTokenBySymbol('stS'), fakeTokenBySymbol('wS')]

  const { result } = testHook(() => {
    return useTotalUsdValue(tokens)
  })

  const humanAmountsIn: HumanTokenAmountWithSymbol[] = [
    { tokenAddress: sonicTokens.sts, humanAmount: '100', symbol: 'stS' },
    { tokenAddress: sonicTokens.ws, humanAmount: '50', symbol: 'wS' },
  ]

  //Wait for price mocks to be loaded
  await actSleep(10)

  const totalUsd = await act(async () => {
    return result.current.usdValueFor(humanAmountsIn)
  })

  // stSTotal + wsTotal = (100 x 2) + (50 x 3) = 350
  expect(totalUsd).toBe('350')
})

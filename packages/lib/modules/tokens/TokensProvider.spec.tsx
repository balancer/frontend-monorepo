import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import {
  defaultGetTokenPricesQueryMock,
  defaultGetTokensQueryMock,
  defaultGetTokensQueryVariablesMock,
  defaultTokenListMock,
} from './__mocks__/token.builders'
import { useTokensLogic } from './TokensProvider'

const initTokensData = defaultGetTokensQueryMock
const initTokenPricesData = defaultGetTokenPricesQueryMock

function testUseTokens() {
  const variables = defaultGetTokensQueryVariablesMock
  const { result } = testHook(() => useTokensLogic(initTokensData, initTokenPricesData, variables))
  return result
}

test('fetches tokens', async () => {
  const result = testUseTokens()

  expect(result.current.tokens).toEqual(initTokensData.tokens)
  expect(result.current.prices).toEqual(initTokenPricesData.tokenPrices)

  await waitFor(() => expect(result.current.tokens.length).toBeGreaterThan(0))

  expect(result.current.tokens).toEqual(defaultTokenListMock)
})

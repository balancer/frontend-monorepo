import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { defaultTokenListMock } from './__mocks__/token.builders'
import { useTokensLogic } from './TokensProvider'

function testUseTokens() {
  const { result } = testHook(() => useTokensLogic())
  return result
}

test('fetches tokens', async () => {
  const result = testUseTokens()

  await waitFor(() => expect(result.current.tokens.length).toBeGreaterThan(0))

  expect(result.current.tokens).toEqual(defaultTokenListMock)
})

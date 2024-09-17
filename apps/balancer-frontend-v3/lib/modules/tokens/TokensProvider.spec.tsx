import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { Address } from 'viem'
import {
  defaultGetTokenPricesQueryMock,
  defaultGetTokensQueryMock,
  defaultGetTokensQueryVariablesMock,
  defaultTokenListMock,
} from './__mocks__/token.builders'
import { _useTokens } from './TokensProvider'

const initTokensData = defaultGetTokensQueryMock
const initTokenPricesData = defaultGetTokenPricesQueryMock

function testUseTokens() {
  const variables = defaultGetTokensQueryVariablesMock
  const { result } = testHook(() => _useTokens(initTokensData, initTokenPricesData, variables))
  return result
}

test('fetches tokens', async () => {
  const result = testUseTokens()

  expect(result.current.tokens).toEqual(initTokensData.tokens)
  expect(result.current.prices).toEqual(initTokenPricesData.tokenPrices)

  await waitFor(() => expect(result.current.tokens.length).toBeGreaterThan(0))

  expect(result.current.tokens).toEqual(defaultTokenListMock)
})

test('gets tokens by token address', async () => {
  const result = testUseTokens()

  const tokenAddresses = ['0xba100000625a3754423978a60c9317c58a424e3d' as Address]

  expect(result.current.getTokensByTokenAddress(tokenAddresses, GqlChain.Mainnet))
    .toMatchInlineSnapshot(`
      {
        "0xba100000625a3754423978a60c9317c58a424e3d": {
          "__typename": "GqlToken",
          "address": "0xba100000625a3754423978a60c9317c58a424e3d",
          "chain": "MAINNET",
          "chainId": 1,
          "decimals": 18,
          "isErc4626": false,
          "logoURI": "https://raw.githubusercontent.com/balancer/tokenlists/main/src/assets/images/tokens/0xba100000625a3754423978a60c9317c58a424e3d.png",
          "name": "Balancer",
          "priority": 0,
          "symbol": "BAL",
          "tradable": true,
        },
      }
    `)
})

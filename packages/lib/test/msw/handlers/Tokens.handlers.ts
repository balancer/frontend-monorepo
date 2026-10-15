import {
  defaultGetTokenPricesQueryMock,
  defaultTokenListMock,
  defaultTokenPriceListMock,
} from '@repo/lib/modules/tokens/__mocks__/token.builders'
import {
  GetTokenPricesDocument,
  GetTokenPricesQuery,
  GetTokensDocument,
} from '@repo/lib/shared/services/api/generated/graphql'
import { getQueryName, mockGQL } from '../utils'
import { GQLResponse, gqlApi } from './msw-helpers'

export function buildTokenListMswHandler(tokenList = defaultTokenListMock) {
  return gqlApi.query(getQueryName(GetTokensDocument), () => {
    return GQLResponse({ tokens: tokenList })
  })
}

export function mockTokenList(tokenList = defaultTokenListMock) {
  mockGQL(buildTokenListMswHandler(tokenList))
}

export function buildTokenPricesMswHandler(tokenPrices = defaultGetTokenPricesQueryMock) {
  return gqlApi.query(getQueryName(GetTokenPricesDocument), () => {
    return GQLResponse(tokenPrices)
  })
}

export function mockTokenPricesList(tokenPrices = defaultTokenPriceListMock) {
  const getTokenPrices: GetTokenPricesQuery = {
    __typename: 'Query',
    tokenPrices,
  }

  mockGQL(buildTokenPricesMswHandler(getTokenPrices))
}

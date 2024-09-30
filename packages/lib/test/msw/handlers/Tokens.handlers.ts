import { graphql } from 'msw'
import { getQueryName, mockGQL } from '../utils'
import { GQLResponse } from './msw-helpers'
import {
  defaultTokenListMock,
  defaultGetTokenPricesQueryMock,
  defaultTokenPriceListMock,
} from '../../../modules/tokens/__mocks__/token.builders'
import {
  GetTokensDocument,
  GetTokenPricesDocument,
  GetTokenPricesQuery,
} from '../../../shared/services/api/generated/graphql'

export function buildTokenListMswHandler(tokenList = defaultTokenListMock) {
  return graphql.query(getQueryName(GetTokensDocument), () => {
    return GQLResponse({ tokens: tokenList })
  })
}

export function mockTokenList(tokenList = defaultTokenListMock) {
  mockGQL(buildTokenListMswHandler(tokenList))
}

export function buildTokenPricesMswHandler(tokenPrices = defaultGetTokenPricesQueryMock) {
  return graphql.query(getQueryName(GetTokenPricesDocument), () => {
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

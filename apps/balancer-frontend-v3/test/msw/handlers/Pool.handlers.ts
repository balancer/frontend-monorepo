import { GetPoolDocument, GetPoolQuery } from '@/lib/shared/services/api/generated/graphql'
import { graphql } from 'msw'
import { getQueryName, mockGQL } from '../utils'
import { aGqlPoolElementMock } from '../builders/gqlPoolElement.builders'
import { GQLResponse } from './msw-helpers'

export const defaultPoolMock = aGqlPoolElementMock()
export const defaultPoolResponseMock: GetPoolQuery = {
  __typename: 'Query',
  pool: defaultPoolMock,
}

export function buildPoolMswHandler(pool = defaultPoolMock) {
  return graphql.query(getQueryName(GetPoolDocument), () => {
    return GQLResponse({ pool: pool })
  })
}

export function mockPool(pool = defaultPoolMock) {
  mockGQL(buildPoolMswHandler(pool))
}

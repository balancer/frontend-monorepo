import { getQueryName, mockGQL } from '../utils'
import { graphql } from 'msw'
import { aGqlPoolMinimalMock } from '../builders/gqlPoolMinimal.builders'
import { GQLResponse } from './msw-helpers'
import { PoolList } from '@repo/lib/modules/pool/pool.types'
import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'

export const defaultPoolListItemMock = aGqlPoolMinimalMock()
export const defaultPoolListMock: PoolList = [defaultPoolListItemMock]

export function buildPoolListMswHandler(poolList = defaultPoolListMock) {
  return graphql.query(getQueryName(GetPoolsDocument), () => {
    return GQLResponse({ pools: poolList })
  })
}

export function mockPoolList(poolList = defaultPoolListMock) {
  mockGQL(buildPoolListMswHandler(poolList))
}

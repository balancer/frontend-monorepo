import { getQueryName, mockGQL } from '../utils'
import { graphql } from 'msw'
import { GQLResponse } from './msw-helpers'
import { anAppGlobalData } from '../../../modules/tokens/__mocks__/AppGlobalData.builders'
import { GetAppGlobalPollingDataDocument } from '../../../shared/services/api/generated/graphql'

export const defaultAppGlobalDataMock = anAppGlobalData()

export function buildAppGlobalDataMswHandler(appGlobalData = defaultAppGlobalDataMock) {
  return graphql.query(getQueryName(GetAppGlobalPollingDataDocument), () => {
    return GQLResponse(appGlobalData)
  })
}

export function mockAppGlobalData(appGlobalData = defaultAppGlobalDataMock) {
  mockGQL(buildAppGlobalDataMswHandler(appGlobalData))
}

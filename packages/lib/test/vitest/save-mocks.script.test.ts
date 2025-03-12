import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    poolId: '<undefined or poolId>', // Use undefined to update all mocks, or a specific poolId to only create/update that specific mock
    apiUrl: 'https://test-api-v3.balancer.fi/graphql',
  }
  await saveApiMocks(options)
})

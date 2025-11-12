import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    // Use undefined to update all mocks, or a specific poolId to only create/update that specific mock
    poolId: '0x2191df821c198600499aa1f0031b1a7514d7a7d9000200000000000000000639',
    apiUrl: 'https://test-api-v3.balancer.fi/graphql',
  }
  await saveApiMocks(options)
})

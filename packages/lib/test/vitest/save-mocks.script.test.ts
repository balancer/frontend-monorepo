import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    poolId: undefined,
    apiUrl: 'https://test-api-v3.balancer.fi/graphql',
  }
  await saveApiMocks(options)
})

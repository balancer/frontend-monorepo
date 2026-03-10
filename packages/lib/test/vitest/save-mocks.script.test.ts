import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    // Use undefined to update all mocks, or a specific poolId to only create/update that specific mock
    poolId: '0x3de27efa2f1aa663ae5d458857e731c129069f29000200000000000000000588',
    apiUrl: 'https://test-api-v3.balancer.fi/graphql',
  }
  await saveApiMocks(options)
})

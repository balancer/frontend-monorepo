import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    // Use undefined to update all mocks, or a specific poolId to only create/update that specific mock
    poolId: '0x25ca5451cd5a50ab1d324b5e64f32c0799661891000200000000000000000018', // fBEETS (Sonic v2)
    apiUrl: 'https://backend-v3.beets-ftm-node.com/',
  }

  await saveApiMocks(options)
})

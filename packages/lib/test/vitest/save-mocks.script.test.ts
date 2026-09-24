import saveApiMocks, { ApiMockOptions } from './saveApiMocks'

test('Save api mocks', async () => {
  const options: ApiMockOptions = {
    // Use undefined to update all mocks, or a specific poolId to only create/update that specific mock
    poolId: '0x944d4ae892de4bfd38742cc8295d6d5164c5593c', // bpt-anS-SiloWS (Sonic)
    apiUrl: 'https://backend-v3.beets-ftm-node.com/',
  }

  await saveApiMocks(options)
})

import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { buildDefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { partialBoosted } from '../../../__mocks__/pool-examples/boosted'
import { Pool } from '../../../pool.types'
import { usePoolStateWithBalancesQuery } from './usePoolStateWithBalancesQuery'

/*
TODO:
Review issue cause by the use of getRpcUrl(chainId) returning http://127.0.0.1:8645/1 (mocked in setup-integration.ts)
inside the SDK implementation
*/
async function testQuery(pool: Pool) {
  const { result } = testHook(() => usePoolStateWithBalancesQuery(pool), {
    wrapper: buildDefaultPoolTestProvider(pool as GqlPoolElement),
  })
  return result
}

describe.skip('usePoolStateWithBalances', () => {
  it('for a partial boosted pool', async () => {
    const pool = getApiPoolMock(partialBoosted)

    const result = await testQuery(pool)

    await waitFor(() => expect(result.current.data?.id).toBeDefined())

    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.data?.id).toBeDefined()
  })
})

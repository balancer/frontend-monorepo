import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { buildDefaultPoolTestProvider, testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { getApiPoolMock } from '../../../__mocks__/api-mocks/api-mocks'
import { partialBoosted } from '../../../__mocks__/pool-examples/boosted'
import { Pool } from '../../../pool.types'
import { usePoolStateWithBalancesQuery } from './usePoolStateWithBalancesQuery'

async function testQuery(pool: Pool) {
  const { result } = testHook(() => usePoolStateWithBalancesQuery(pool), {
    wrapper: buildDefaultPoolTestProvider(pool as GqlPoolElement),
  })
  return result
}

describe('usePoolStateWithBalances', () => {
  it('for a partial boosted pool', async () => {
    const pool = getApiPoolMock(partialBoosted)

    const result = await testQuery(pool)

    await waitFor(() => expect(result.current.data?.id).toBeDefined())

    expect(result.current.isLoading).toBeFalsy()
    expect(result.current.data?.id).toBeDefined()
  })
})

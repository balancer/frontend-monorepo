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

    await waitFor(
      () => {
        if (result.current.error) throw result.current.error
        expect(result.current.isSuccess).toBe(true)
      },
      { timeout: 30_000 }
    )

    expect(result.current.data?.id).toBeDefined()
  })
})

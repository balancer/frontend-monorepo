import { GetPoolQuery } from '@repo/lib/shared/services/api/generated/graphql'
import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { mockPool } from '@repo/lib/test/msw/handlers/Pool.handlers'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { BaseVariant } from './pool.types'
import { usePoolLogic } from './PoolProvider'
import {} from '@repo/lib/test/msw/builders/gqlStaking.builders'
import { getApiPoolMock } from './__mocks__/api-mocks/api-mocks'
import { scUsdStS } from './__mocks__/pool-examples/flat'
import { GqlPoolElement } from '@repo/lib/shared/services/api/graphql-derived-types'

const sonicPool = getApiPoolMock(scUsdStS) as unknown as GqlPoolElement
const sonicPoolResponse: GetPoolQuery = { __typename: 'Query', pool: sonicPool }

async function testUsePool({
  initialData = sonicPoolResponse,
}: {
  initialData?: GetPoolQuery
} = {}) {
  mockPool(sonicPool)

  const { result } = testHook(() => {
    return usePoolLogic({
      id: scUsdStS.poolId,
      chain: GqlChainValues.Sonic,
      variant: BaseVariant.v2,
      initialData,
    })
  })

  await waitFor(() => expect(result.current.pool).toBeDefined())
  return result
}

test('fetches v2 pool', async () => {
  const result = await testUsePool()
  expect(result.current.pool).toMatchObject(sonicPool)
})

describe('Gql pool helpers', () => {
  test('returns pool explorer link', async () => {
    const result = await testUsePool()

    expect(result.current.poolExplorerLink).toBe(
      'https://sonicscan.org/address/0x25ca5451cd5a50ab1d324b5e64f32c0799661891'
    )
  })

  test('returns gauge explorer link when the pool', async () => {
    const result = await testUsePool()

    expect(result.current.gaugeExplorerLink).toBe(
      `https://sonicscan.org/address/0xa472438718fe7785107fcbe584d39183a6420d36`
    )
  })

  test('knows if there is gauge', async () => {
    const result = await testUsePool()

    expect(result.current.hasGaugeAddress).toBeTruthy()
    expect(result.current.gaugeAddress).toBe('0xa472438718fe7785107fcbe584d39183a6420d36')
  })
})

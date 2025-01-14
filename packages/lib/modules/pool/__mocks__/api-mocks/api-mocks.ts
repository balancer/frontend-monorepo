import { Pool } from '../../pool.types'
import { PoolExample } from '../pool-examples/pool-examples.types'

import { allApiMocks } from './allApiMocks'
import { v2SepoliaStableWithERC4626Mock } from './v2SepoliaStableWithERC4626Mock'
import { v3SepoliaNestedBoostedMock } from './v3SepoliaNestedBoostedMock'

const allPoolApiMocks: Pool[] = [
  ...allApiMocks,
  // Sepolia pool mocks must be manually added as they are not available in production API
  v2SepoliaStableWithERC4626Mock,
  v3SepoliaNestedBoostedMock,
]

export function getApiPoolMock(poolIdOrExample: string | PoolExample): Pool {
  const poolId: string =
    typeof poolIdOrExample === 'string' ? poolIdOrExample : poolIdOrExample.poolId
  const pool = allPoolApiMocks.find(pool => pool.id.toLowerCase() === poolId.toLowerCase())

  if (!pool) {
    throw new Error(
      `Api mock not found for poolId: ${poolId}
      Double check that savePoolMock is creating your pool and that allApiMocks includes the pool you're looking for.`
    )
  }

  return pool
}

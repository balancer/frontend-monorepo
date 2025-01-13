import { Pool } from '../../pool.types'
import { b_80BAL_20WETH } from './b_80BAL_20WETH'
import { osETH_wETH_BPT } from './osETH_wETH_BPT'

const allApiMocks: Pool[] = [b_80BAL_20WETH, osETH_wETH_BPT]

export function getApiPoolMock(poolId: string): Pool {
  const pool = allApiMocks.find(pool => pool.id === poolId)

  if (!pool) {
    throw new Error(
      `Api mock not found for poolId: ${poolId}.
      Double check that savePoolMock is creating your pool and that allApiMocks includes the pool you're looking for.`
    )
  }

  return pool
}

import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { Pool } from '../pool.types'
import { usePoolEnrichWithOnChainData } from './usePoolEnrichWithOnChainData'
import { usdcFlyStS } from '../__mocks__/pool-examples/flat'
import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'
import { anSSiloWSBoosted } from '../__mocks__/pool-examples/boosted'

function testPoolEnrichWithOnChainData(pool: Pool) {
  const { result } = testHook(() => usePoolEnrichWithOnChainData(pool))
  return result
}

function enrichesWithOnChainData(example: typeof usdcFlyStS) {
  const pool = getApiPoolMock(example)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  return result
}

test('enriches V3 weighted pool with on-chain data', async () => {
  const result = enrichesWithOnChainData(usdcFlyStS)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0)
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

test('enriches V3 boosted pool with on-chain data', async () => {
  const result = enrichesWithOnChainData(anSSiloWSBoosted)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0)
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

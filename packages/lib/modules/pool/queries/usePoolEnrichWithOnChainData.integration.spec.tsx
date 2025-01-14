import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { testHook } from '@repo/lib/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { Pool } from '../PoolProvider'
import { fetchPoolMock } from '../__mocks__/fetchPoolMock'
import { usePoolEnrichWithOnChainData } from './usePoolEnrichWithOnChainData'
import { balWeth8020 } from '../__mocks__/pool-examples/flat'
import { getApiPoolMock } from '../__mocks__/api-mocks/api-mocks'

function testPoolEnrichWithOnChainData(pool: Pool) {
  const { result } = testHook(() => usePoolEnrichWithOnChainData(pool))
  return result
}

test('enriches V3 pool with on-chain data', async () => {
  const pool = getApiPoolMock(balWeth8020)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0) // Sum(api token balances  * mocked token prices (see defaultTokenPriceListMock))
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

test('enriches V2 pool with on-chain data', async () => {
  const pool = getApiPoolMock(balWeth8020)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0) // Sum(api token balances  * mocked token prices (see defaultTokenPriceListMock))
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

test('enriches V1 Cow AMM pool with on-chain data', async () => {
  const cowPoolId = '0xf706c50513446d709f08d3e5126cd74fb6bfda19'

  const pool = await fetchPoolMock(cowPoolId, GqlChain.Mainnet)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0) // Sum(api token balances  * mocked token prices (see defaultTokenPriceListMock))
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

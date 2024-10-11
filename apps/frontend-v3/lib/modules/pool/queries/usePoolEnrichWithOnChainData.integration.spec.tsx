import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { defaultTestUserAccount } from '@/test/anvil/anvil-setup'
import { testHook } from '@/test/utils/custom-renderers'
import { waitFor } from '@testing-library/react'
import { Pool } from '../PoolProvider'
import { getPoolMock } from '../__mocks__/getPoolMock'
import { usePoolEnrichWithOnChainData } from './usePoolEnrichWithOnChainData'

function testPoolEnrichWithOnChainData(pool: Pool) {
  const { result } = testHook(() => usePoolEnrichWithOnChainData(pool))
  return result
}

// TODO: un-skip when pool 0xec1b5ca86c83c7a85392063399e7d2170d502e00 is available in production api
test.skip('enriches V3 pool with on-chain data', async () => {
  const poolId = '0xec1b5ca86c83c7a85392063399e7d2170d502e00' // V3 Balancer 50 BAL 50 WETH (sepolia)
  const pool = await getPoolMock(poolId, GqlChain.Sepolia, defaultTestUserAccount)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0) // Sum(api token balances  * mocked token prices (see defaultTokenPriceListMock))
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

test('enriches V2 pool with on-chain data', async () => {
  const poolId = '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014' // V2 B-80BAL-20WETH

  const pool = await getPoolMock(poolId, GqlChain.Mainnet)

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

  const pool = await getPoolMock(cowPoolId, GqlChain.Mainnet)

  // delete values to ensure that onchain data is used
  pool.dynamicData.totalLiquidity = '0'
  pool.dynamicData.totalShares = '0'

  const result = testPoolEnrichWithOnChainData(pool)

  await waitFor(() => expect(result.current.isLoading).toBeFalsy())

  expect(Number(result.current.pool.dynamicData.totalLiquidity)).toBeGreaterThan(0) // Sum(api token balances  * mocked token prices (see defaultTokenPriceListMock))
  expect(Number(result.current.pool.dynamicData.totalShares)).toBeGreaterThan(0)
})

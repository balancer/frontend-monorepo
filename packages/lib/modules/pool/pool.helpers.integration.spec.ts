/* eslint-disable max-len */
import {
  getActionableTokenSymbol,
  getPoolActionableTokens,
  getStandardRootTokens,
  isStandardOrUnderlyingRootToken,
} from './pool.helpers'
import { Pool } from './pool.types'

// Unskip when there is a non-sepolia nested pool in production api
describe.skip('pool helper', async () => {
  // const nestedPoolId = '0x693cc6a39bbf35464f53d6a5dbf7d6c2fa93741c' // Sepolia 50% WETH - 50% boosted USDC/USDT

  const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9' // root token
  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // underlying token
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // underlying token

  // const pool = await getPoolMock(nestedPoolId, GqlChain.Sepolia)
  const pool = {} as Pool

  it('poolActionableTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool)
    expect(poolActionableTokens.map(t => t.address).sort()).toEqual([
      wethAddress,
      usdcSepoliaAddress,
      usdtSepoliaAddress,
    ])
  })

  it('isStandardRootToken', async () => {
    expect(isStandardOrUnderlyingRootToken(pool, wethAddress)).toBeTruthy()
    expect(isStandardOrUnderlyingRootToken(pool, usdcSepoliaAddress)).toBeFalsy()
    expect(isStandardOrUnderlyingRootToken(pool, usdtSepoliaAddress)).toBeFalsy()
  })

  it('getStandardRootTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool)

    const standardRootTokens = getStandardRootTokens(pool, poolActionableTokens)
    expect(standardRootTokens.map(t => t.address).sort()).toEqual([wethAddress]) // only WETH is a standard root token
  })

  it('getActionableTokenSymbol ', async () => {
    expect(getActionableTokenSymbol(wethAddress, pool)).toEqual('WETH')
  })
})

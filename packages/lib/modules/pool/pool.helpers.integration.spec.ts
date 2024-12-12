/* eslint-disable max-len */
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { fakeGetToken } from '@repo/lib/test/data/all-gql-tokens.fake'
import {
  getPoolActionableTokens,
  getStandardRootTokens,
  isStandardOrUnderlyingRootToken,
} from './pool.helpers'
// Unskip when sepolia V3 pools are available in production api
describe.skip('pool helper', async () => {
  // const nestedPoolId = '0x42de4fa875126fdbaf590b2fc3802adbca58acee' // Sepolia Balancer DAI - boosted USDC/USDT

  const daiSepoliaAddress = '0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357' // root token
  const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // underlying token
  const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // underlying token
  // const pool = await getPoolMock(nestedPoolId, GqlChain.Sepolia)
  const pool = {} as GqlPoolElement

  it('poolActionableTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool, fakeGetToken)
    expect(poolActionableTokens.map(t => t.address).sort()).toEqual([
      usdcSepoliaAddress,
      usdtSepoliaAddress,
      daiSepoliaAddress,
    ])
  })

  it('isStandardRootToken', async () => {
    expect(isStandardOrUnderlyingRootToken(pool, daiSepoliaAddress)).toBeTruthy()
    expect(isStandardOrUnderlyingRootToken(pool, usdcSepoliaAddress)).toBeFalsy()
    expect(isStandardOrUnderlyingRootToken(pool, usdtSepoliaAddress)).toBeFalsy()
  })

  it('getStandardRootTokens', async () => {
    const poolActionableTokens = getPoolActionableTokens(pool, fakeGetToken)

    const standardRootTokens = getStandardRootTokens(pool, poolActionableTokens)
    expect(standardRootTokens.map(t => t.address).sort()).toEqual([daiSepoliaAddress]) // only DAI is a standard root token
  })
})

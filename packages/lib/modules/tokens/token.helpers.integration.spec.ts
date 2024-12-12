/* eslint-disable max-len */
import { GqlPoolElement } from '@repo/lib/shared/services/api/generated/graphql'
import { getLeafTokens } from './token.helpers'

const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9'
const usdcAaveAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)
const usdtAaveAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // Sepolia underlying usdcAave faucet address (temporary until we have the real one)

// const poolId = '0x0270daf4ee12ccb1abc8aa365054eecb1b7f4f6b' // Boosted Aave USDC-USDT / WETH
// const nestedPool = await getPoolMock(poolId, GqlChain.Sepolia)
const nestedPool = {} as GqlPoolElement

// Unskip when sepolia V3 pools are available in production api
describe.skip('When adding nested liquidity for a weighted pool', () => {
  test('has zero price impact', async () => {
    const leafTokens = getLeafTokens(nestedPool.poolTokens)

    expect(leafTokens).toMatchObject([
      {
        address: usdcAaveAddress,
        decimals: 6,
        index: 0,
        name: 'USDC (AAVE Faucet)',
        symbol: 'usdc-aave',
      },
      {
        address: usdtAaveAddress,
        decimals: 6,
        index: 1,
        name: 'USDT (AAVE Faucet)',
        symbol: 'usdt-aave',
      },
      {
        address: wethAddress,
        decimals: 18,
        hasNestedPool: false,
        index: 1,
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
    ])
  })
})

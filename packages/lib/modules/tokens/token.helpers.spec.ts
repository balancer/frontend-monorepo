import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  getLeafTokens,
  isWrappedNativeAsset,
  swapNativeWithWrapped,
  swapWrappedWithNative,
} from './token.helpers'
import { HumanTokenAmountWithAddress } from './token.types'
import { ethAddress, wETHAddress } from '@repo/lib/debug-helpers'
import { InputAmount } from '@balancer/sdk'
import { v3SepoliaNestedBoostedMock } from '../pool/__mocks__/api-mocks/v3SepoliaNestedBoostedMock'
import { PoolToken } from '../pool/pool.types'

test('isWrappedNativeAsset', () => {
  expect(isWrappedNativeAsset(wETHAddress, GqlChain.Mainnet)).toBeTruthy()
})

test('swapWrappedWithNative', () => {
  const inputAmounts: HumanTokenAmountWithAddress[] = [
    {
      humanAmount: '1',
      tokenAddress: wETHAddress,
      symbol: 'WETH',
    },
  ]
  const result = swapWrappedWithNative(inputAmounts, GqlChain.Mainnet)
  expect(result).toEqual([{ humanAmount: '1', tokenAddress: ethAddress, symbol: 'WETH' }])
})

test('swapNativeWithWrapped', () => {
  const wethAddress = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
  const inputAmounts: InputAmount[] = [
    {
      address: ethAddress,
      rawAmount: 1000000000000000000n,
      decimals: 18,
    },
  ]
  const result = swapNativeWithWrapped(inputAmounts, GqlChain.Mainnet)
  expect(result).toEqual([
    {
      address: wethAddress,
      rawAmount: 1000000000000000000n,
      decimals: 18,
    },
  ])
})

describe('When adding nested liquidity for a weighted pool', () => {
  test('has zero price impact', async () => {
    const leafTokens = getLeafTokens(v3SepoliaNestedBoostedMock.poolTokens as PoolToken[])

    const wethAddress = '0x7b79995e5f793a07bc00c21412e50ecae098e7f9' // root token
    const usdcSepoliaAddress = '0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8' // underlying token
    const usdtSepoliaAddress = '0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0' // underlying token

    expect(leafTokens).toMatchObject([
      {
        address: usdcSepoliaAddress,
        decimals: 6,
        name: 'USDC (AAVE Faucet)',
        symbol: 'usdc-aave',
      },
      {
        address: usdtSepoliaAddress,
        decimals: 6,
        name: 'USDT (AAVE Faucet)',
        symbol: 'usdt-aave',
      },
      {
        address: wethAddress,
        decimals: 18,
        hasNestedPool: false,
        name: 'Wrapped Ether',
        symbol: 'WETH',
      },
    ])
  })
})

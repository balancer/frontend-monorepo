import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import {
  FakeTokenSymbol,
  fakeGetToken,
  fakeTokenBySymbol,
  fakeTokenSymbols,
} from './all-gql-tokens.fake'

test('Has fake definitions for all the symbols in FakeTokenSymbol', () => {
  fakeTokenSymbols.forEach((symbol: FakeTokenSymbol) => {
    expect(fakeTokenBySymbol(symbol)).toBeDefined()
  })
})

test('fakeGetToken', () => {
  expect(fakeGetToken('0x7b79995e5f793a07bc00c21412e50ecae098e7f9', GqlChain.Sepolia)?.symbol).toBe(
    'WETH'
  )

  expect(fakeGetToken('0x8a88124522dbbf1e56352ba3de1d9f78c143751e', GqlChain.Sepolia)?.symbol).toBe(
    'stataEthUSDC'
  )

  expect(fakeGetToken('0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8', GqlChain.Sepolia)?.symbol).toBe(
    'usdc-aave'
  )
})

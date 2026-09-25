import { GqlChainValues } from '@repo/lib/shared/services/api/graphql-enums'
import { isWrappedNativeAsset, swapNativeWithWrapped, swapWrappedWithNative } from './token.helpers'
import { HumanTokenAmountWithSymbol } from './token.types'
import { InputAmount } from '@balancer/sdk'
import { sonicTokens } from '@repo/lib/test/integration/sonic-fixtures'

test('isWrappedNativeAsset', () => {
  expect(isWrappedNativeAsset(sonicTokens.ws, GqlChainValues.Sonic)).toBeTruthy()
})

test('swapWrappedWithNative', () => {
  const inputAmounts: HumanTokenAmountWithSymbol[] = [
    {
      humanAmount: '1',
      tokenAddress: sonicTokens.ws,
      symbol: 'wS',
    },
  ]

  const result = swapWrappedWithNative(inputAmounts, GqlChainValues.Sonic)
  expect(result).toEqual([{ humanAmount: '1', tokenAddress: sonicTokens.s, symbol: 'wS' }])
})

test('swapNativeWithWrapped', () => {
  const inputAmounts: InputAmount[] = [
    {
      address: sonicTokens.s,
      rawAmount: 1000000000000000000n,
      decimals: 18,
    },
  ]

  const result = swapNativeWithWrapped(inputAmounts, GqlChainValues.Sonic)

  expect(result).toEqual([
    {
      address: sonicTokens.ws,
      rawAmount: 1000000000000000000n,
      decimals: 18,
    },
  ])
})

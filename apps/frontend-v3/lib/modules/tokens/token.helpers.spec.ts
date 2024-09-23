import { GqlChain } from '@/lib/shared/services/api/generated/graphql'
import { isWrappedNativeAsset, swapNativeWithWrapped, swapWrappedWithNative } from './token.helpers'
import { HumanTokenAmountWithAddress } from './token.types'
import { ethAddress, wETHAddress } from '@/lib/debug-helpers'
import { InputAmount } from '@balancer/sdk'

test('isWrappedNativeAsset', () => {
  expect(isWrappedNativeAsset(wETHAddress, GqlChain.Mainnet)).toBeTruthy()
})

test('swapWrappedWithNative', () => {
  const inputAmounts: HumanTokenAmountWithAddress[] = [
    {
      humanAmount: '1',
      tokenAddress: wETHAddress,
    },
  ]
  const result = swapWrappedWithNative(inputAmounts, GqlChain.Mainnet)
  expect(result).toEqual([{ humanAmount: '1', tokenAddress: ethAddress }])
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

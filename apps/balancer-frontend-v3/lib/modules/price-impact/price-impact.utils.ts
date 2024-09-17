import { bn } from '@/lib/shared/utils/numbers'
import BigNumber from 'bignumber.js'

/*
 ABA priceImpact calculation has some known limitations. Examples:
 - You can’t calculate it for add liquidity amounts that are higher than the pool balance (it will return a BAL#001 error)
 - Add Liquidity Unbalanced uses a querySwap and Weighted pools have a limit that you can’t swap > 30% of the token balance in the pool
 for add liquidity amounts that are higher than the pool balance (it will return a BAL#304 error)

 For now, if we receive a ContractFunctionExecutionError we will assume that it is an ABA limitation and we will show an "unknown price impact" warning to the user.

 Note that the SDK error could change, so we should keep an eye on it.
 */
export function isUnhandledAddPriceImpactError(error: Error | null): boolean {
  if (!error) return false
  if (cannotCalculatePriceImpactError(error)) return false
  return true
}

export function cannotCalculatePriceImpactError(error: Error | null): boolean {
  if (error && error.name === 'ContractFunctionExecutionError') {
    return true
  }
  return false
}

/**
 * Crude price impact calculation used for Swaps.
 *
 * i.e. What is the difference between USD in vs USD out. Only considers
 * negative diffs, positive diffs are considered 0. Absolute value is returned,
 * e.g. 0.01 is 1% price impact which means the usdOut is 1% less than usdIn.
 */
export function calcMarketPriceImpact(usdIn: string, usdOut: string) {
  if (bn(usdIn).isZero() || bn(usdOut).isZero()) return '0'

  // priceImpact = 1 - (usdOut / usdIn)
  const priceImpact = bn(1).minus(bn(usdIn).div(usdOut))

  return BigNumber.min(priceImpact, 0).abs().toString()
}

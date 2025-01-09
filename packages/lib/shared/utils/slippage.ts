import { HumanAmount } from '@balancer/sdk'
import { bn, fNum } from './numbers'

/*
  We use this small slippage percentage by default for proportional adds because SDK calculation queries are not 100% precise.
  For example, addLiquidityBoosted queries with tokens with 6 decimals would always fail if we used 0% slippage by default.
  This 0.01% is big enough to prevent tx simulation errors in all types of proportional adds while keeping the dust amount small.
*/
export const defaultProportionalSlippagePercentage = '0.01'

export function slippageDiffLabel(actualAmount: HumanAmount, expectedAmount: HumanAmount) {
  if (!expectedAmount) return ''
  const bptDiff = bn(actualAmount).minus(expectedAmount)

  if (bptDiff.isZero()) return 'Slippage: 0%'

  const slippage = bptDiff.div(expectedAmount).times(100).toString()

  return `Slippage: ${fNum('slippage', slippage)}`
}

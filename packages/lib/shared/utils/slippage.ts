import { HumanAmount } from '@balancer/sdk'
import { bn, fNum } from './numbers'
import { Pool } from '@repo/lib/modules/pool/pool.types'

export function getDefaultProportionalSlippagePercentage(pool: Pool) {
  /*
    We use this small slippage percentage by default for boosted proportional adds because SDK addLiquidityBoosted queries are not 100% precise.
    The error is ~1000 wei, which is negligible on 18 decimal tokens but not as much on 6 decimals tokens (this is a SC limitation).
    Using 0.02% is big enough to prevent tx simulation errors in all types of boosted proportional adds while keeping the dust amount small.
  */
  const defaultBoostedProportionalSlippagePercentage = '0.02'
  const defaultProportionalSlippagePercentage = '0'

  return pool.hasErc4626 || pool.hasNestedErc4626
    ? defaultBoostedProportionalSlippagePercentage
    : defaultProportionalSlippagePercentage
}

export function slippageDiffLabel(actualAmount: HumanAmount, expectedAmount: HumanAmount) {
  if (!expectedAmount) return ''
  const bptDiff = bn(actualAmount).minus(expectedAmount)

  if (bptDiff.isZero()) return 'Slippage: 0%'

  const slippage = bptDiff.div(expectedAmount).times(100).toString()

  return `Slippage: ${fNum('slippage', slippage)}`
}

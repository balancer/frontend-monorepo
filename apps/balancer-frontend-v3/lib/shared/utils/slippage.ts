import { HumanAmount } from '@balancer/sdk'
import { bn, fNum } from './numbers'

export function slippageDiffLabel(actualAmount: HumanAmount, expectedAmount: HumanAmount) {
  if (!expectedAmount) return ''
  const bptDiff = bn(actualAmount).minus(expectedAmount)

  if (bptDiff.isZero()) return 'Slippage: 0%'

  const slippage = bptDiff.div(expectedAmount).times(100).toString()

  return `Slippage: ${fNum('slippage', slippage)}`
}

import { HumanAmount } from '@balancer/sdk'
import { parseUnits } from 'viem'

export const SECONDS_IN_DAY = 86400

export function testRawAmount(humanAmount: HumanAmount) {
  return parseUnits(humanAmount, 18)
}

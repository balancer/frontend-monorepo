import { HumanAmount } from '@balancer/sdk'

export type ReliquaryPosition = {
  poolId: string
  relicId: string
  amount: HumanAmount
  entry: number
  level: number
}

import { HumanAmount } from '@balancer/sdk'

export type ReliquaryFarmPosition = {
  poolId: string
  relicId: string
  amount: HumanAmount
  entry: number
  level: number
}

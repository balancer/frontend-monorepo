import { AmountHumanReadable } from '@repo/lib/modules/tokens/token.types'

export type ReliquaryFarmPosition = {
  poolId: string
  relicId: string
  amount: AmountHumanReadable
  entry: number
  level: number
}

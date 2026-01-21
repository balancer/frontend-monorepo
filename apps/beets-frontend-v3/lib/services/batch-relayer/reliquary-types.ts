import { Address } from 'viem'

export interface EncodeReliquaryCreateRelicAndAddLiquidityInput {
  sender: Address
  recipient: Address
  token: Address
  poolId: bigint
  amount: bigint
  outputReference: bigint
}

export interface EncodeReliquaryAddLiquidityInput {
  sender: Address
  token: Address
  relicId: bigint
  amount: bigint
  outputReference: bigint
}

export interface EncodeReliquaryWithdrawAndHarvestInput {
  recipient: Address
  relicId: bigint
  amount: bigint
  outputReference: bigint
}

export interface EncodeReliquaryHarvestAllInput {
  relicIds: bigint[]
  recipient: Address
}

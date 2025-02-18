import { ExitPoolRequest, JoinPoolRequest } from '@balancer/sdk'
import { Address, Hex } from 'viem'

export type OutputReference = {
  index: bigint
  key: bigint
}

export interface EncodeExitPoolInput {
  poolId: Hex
  poolKind: number
  sender: Address
  recipient: Address
  outputReferences: OutputReference[]
  exitPoolRequest: ExitPoolRequest
}

export interface EncodeJoinPoolInput {
  poolId: Hex
  poolKind: number
  sender: Address
  recipient: Address
  joinPoolRequest: JoinPoolRequest
  value: bigint
  outputReference: bigint
}

export type ExitPoolData = ExitPoolRequest & Omit<EncodeExitPoolInput, 'exitPoolRequest'>

export interface EncodeGaugeDepositInput {
  gauge: Address
  sender: Address
  recipient: Address
  amount: bigint
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EncodeGaugeWithdrawInput extends EncodeGaugeDepositInput {}

export interface EncodeGaugeClaimRewardsInput {
  gauges: Address[]
}

export interface EncodeGaugeMintInput {
  gauges: Address[]
  outputReference: bigint
}

export interface EncodeReliquaryCreateRelicAndDepositInput {
  sender: Address
  recipient: Address
  token: Address
  poolId: bigint
  amount: bigint
  outputReference: bigint
}

export interface EncodeReliquaryDepositInput {
  sender: Address
  token: Address
  relicId: bigint
  amount: bigint
  outputReference: bigint
}

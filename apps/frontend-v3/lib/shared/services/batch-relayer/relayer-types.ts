import { ExitPoolRequest } from '@balancer/sdk'
import { Numberish } from '../../utils/numbers'
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

export type ExitPoolData = ExitPoolRequest & Omit<EncodeExitPoolInput, 'exitPoolRequest'>

export interface EncodeMasterChefDepositInput {
  sender: string
  recipient: string
  token: string
  pid: number
  amount: Numberish
  outputReference: Numberish
}

export interface EncodeMasterChefWithdrawInput {
  recipient: string
  pid: number
  amount: Numberish
  outputReference: Numberish
}

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

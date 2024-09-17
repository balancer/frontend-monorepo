import { GqlToken } from '@/lib/shared/services/api/generated/graphql'
import { Address, HumanAmount } from '@balancer/sdk'

export type TokenBase = Pick<GqlToken, 'address' | 'name' | 'symbol' | 'decimals' | 'chainId'>

export interface TokenAmount {
  address: string
  chainId: number
  decimals: number
  amount: bigint
  formatted: string
}

export interface TokenAmountHumanReadable {
  address: string
  amount: string
}

export type HumanTokenAmountWithAddress = {
  humanAmount: HumanAmount | ''
  tokenAddress: Address
}

export interface TokenAmountScaled {
  address: string
  amount: bigint
}
export interface TokenBaseWithAmount extends TokenBase {
  amount: string
}

export type AmountHumanReadable = string
export type AmountScaled = bigint
export type AmountScaledString = string

export type BalanceMap = Map<string, AmountHumanReadable>

export interface AmountHumanReadableMap {
  [address: string]: AmountHumanReadable
}

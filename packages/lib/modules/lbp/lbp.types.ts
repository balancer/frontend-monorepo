import { HumanAmount } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export enum UserActions {
  BUY_AND_SELL = 'buy_and_sell',
  BUY_ONLY = 'buy_only',
}

export enum WeightAdjustmentType {
  LINEAR_90_10 = 'linear_90_10',
  LINEAR_90_50 = 'linear_90_50',
  CUSTOM = 'custom',
}

export type SaleStructureForm = {
  selectedChain: GqlChain
  launchTokenAddress: string
  startDateTime: string
  endDateTime: string
  collateralTokenAddress: string
  weightAdjustmentType: WeightAdjustmentType
  customStartWeight: number
  customEndWeight: number
  userActions: UserActions
  fee: number
  saleTokenAmount: HumanAmount | ''
  collateralTokenAmount: HumanAmount | ''
}

export type ProjectInfoForm = {
  name: string
  description: string
  tokenIconUrl: string
  websiteUrl: string
  xHandle?: string
  telegramHandle?: string
  discordUrl?: string
  owner: string
  poolCreator: string
  disclaimerAccepted: boolean
}

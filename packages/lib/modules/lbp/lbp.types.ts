import { HumanAmount } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type SaleStructureForm = {
  selectedChain: GqlChain
  launchTokenAddress: string
  startDateTime: string
  endDateTime: string
  collateralTokenAddress: string
  weightAdjustmentType: 'linear_90_10' | 'linear_90_50' | 'custom'
  customStartWeight: number
  customEndWeight: number
  userActions: 'buy_and_sell' | 'only_buy'
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

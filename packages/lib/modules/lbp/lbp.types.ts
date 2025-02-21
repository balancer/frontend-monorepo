import { HumanAmount } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type SaleStructureForm = {
  selectedChain: GqlChain
  launchTokenAddress: string
  startTime: string
  endTime: string
  collateralTokenAddress: string
  weightAdjustmentType: 'linear_90_10' | 'linear_90_50'
  userActions: 'buy_and_sell' | 'buy_only'
  saleTokenAmount: HumanAmount | ''
  collateralTokenAmount: HumanAmount | ''
}

export type ProjectInfoForm = {
  name: string
  description: string
  tokenIconUrl: string
  websiteUrl: string
  xHandle: string
  telegramHandle?: string
  discordUrl?: string
}

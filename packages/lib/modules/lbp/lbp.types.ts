import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export type SaleStructureForm = {
  selectedChain: GqlChain
  launchTokenAddress: string
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

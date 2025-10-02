import { InputAmount, InitPoolInputV3, PoolType } from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { ApiToken } from '@repo/lib/modules/tokens/token.types'
import { type ProjectConfig } from '@repo/lib/config/config.types'
import { WeightedPoolStructure } from './constants'

export type InputAmountWithSymbol = InputAmount & { symbol: string }

export type ExtendedInitPoolInputV3 = Omit<InitPoolInputV3, 'amountsIn'> & {
  amountsIn: InputAmountWithSymbol[]
}

export type SupportedPoolTypes =
  | PoolType.Stable
  | PoolType.Weighted
  | PoolType.StableSurge
  | PoolType.ReClamm
// | PoolType.GyroE

export type PoolTypeDetails = {
  label: string
  maxTokens: number
}

export type PoolCreationToken = {
  address: Address | undefined
  rateProvider: Address | ''
  paysYieldFees: boolean
  weight?: string
  amount: string
  data?: ApiToken
}

export type PoolCreationForm = {
  protocol: ProjectConfig['projectId']
  network: GqlChain
  weightedPoolStructure: WeightedPoolStructure
  poolType: SupportedPoolTypes
  poolTokens: PoolCreationToken[]
  name: string
  symbol: string
  swapFeeManager: Address | ''
  pauseManager: Address | ''
  swapFeePercentage: string
  amplificationParameter: string
  poolHooksContract: Address | ''
  enableDonation: boolean
  disableUnbalancedLiquidity: boolean
  hasAcceptedTokenWeightsRisk: boolean
  hasAcceptedPoolCreationRisk: boolean
}

export type ReClammConfig = {
  initialMinPrice: string
  initialTargetPrice: string
  initialMaxPrice: string
  priceRangePercentage: string
  priceShiftDailyRate: string
  centerednessMargin: string
}

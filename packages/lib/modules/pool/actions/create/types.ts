import {
  InputAmount,
  InitPoolInputV3,
  PoolType,
  CreatePoolV3WeightedInput,
  CreatePoolV3StableInput,
  CreatePoolStableSurgeInput,
  CreatePoolReClammInput,
  CreatePoolGyroECLPInput,
  CreatePoolLiquidityBootstrappingInput,
} from '@balancer/sdk'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { Address } from 'viem'
import { ApiOrCustomToken } from '@repo/lib/modules/tokens/token.types'
import { WeightedPoolStructure } from './constants'
import { ProjectConfig } from '@repo/lib/config/config.types'

export type InitPoolInputAmount = InputAmount & { symbol: string; weight?: string }

export type ExtendedInitPoolInput = Omit<InitPoolInputV3, 'amountsIn'> & {
  amountsIn: InitPoolInputAmount[]
}

export type SupportedPoolTypes =
  | PoolType.Stable
  | PoolType.Weighted
  | PoolType.StableSurge
  | PoolType.ReClamm
  | PoolType.GyroE
  | PoolType.CowAmm

export type PoolTypeDetails = {
  label: string
  maxTokens: number
  description: string
}

export type PoolCreationToken = {
  address: Address | undefined
  rateProvider: Address | ''
  paysYieldFees: boolean
  weight?: string
  amount: string
  data?: ApiOrCustomToken
  usdPrice?: string
}

export type PoolCreationForm = {
  protocol: ProjectConfig['projectName'] | 'CoW'
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
  hasAcceptedSimilarPoolsWarning: boolean
}

export type ReClammConfig = {
  initialMinPrice: string
  initialTargetPrice: string
  initialMaxPrice: string
  priceRangePercentage: string
  priceShiftDailyRate: string
  centerednessMargin: string
}

export type EclpConfigForm = {
  alpha: string
  beta: string
  c: string
  s: string
  lambda: string
  peakPrice: string
}

type CreateCowAmmInput = {
  symbol: string
  name: string
  poolType: PoolType.CowAmm
  chainId: number
  protocolVersion: 1
  poolTokens: PoolCreationToken[]
}

export type CreatePoolInput =
  | CreatePoolV3WeightedInput
  | CreatePoolV3StableInput
  | CreatePoolStableSurgeInput
  | CreatePoolReClammInput
  | CreatePoolGyroECLPInput
  | CreateCowAmmInput
  | CreatePoolLiquidityBootstrappingInput

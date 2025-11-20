import { PoolType, STABLE_POOL_CONSTRAINTS } from '@balancer/sdk'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { zeroAddress } from 'viem'
import {
  SupportedPoolTypes,
  PoolTypeDetails,
  PoolCreationToken,
  PoolCreationForm,
  ReClammConfig,
  EclpConfigForm,
} from './types'
import { getSwapFeePercentageOptions } from './helpers'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export const NUM_FORMAT = '0.00000000' // up to 8 decimals?
export const PERCENTAGE_DECIMALS = 16
export const DEFAULT_DECIMALS = 18
export const MAX_POOL_NAME_LENGTH = 32
export const MAX_POOL_SYMBOL_LENGTH = 26
export const MAX_SWAP_FEE_PERCENTAGE = 10
export const REQUIRED_TOTAL_WEIGHT = 100
export const AMPLIFICATION_PARAMETER_OPTIONS = ['100', '1000']
export const MIN_AMPLIFICATION_PARAMETER = Number(STABLE_POOL_CONSTRAINTS.MIN_AMP)
export const MAX_AMPLIFICATION_PARAMETER = Number(STABLE_POOL_CONSTRAINTS.MAX_AMP)
export const MAX_LAMBDA = 100000000

export const POOL_TYPES: Record<SupportedPoolTypes, PoolTypeDetails> = {
  [PoolType.Stable]: { label: 'Stable', maxTokens: 5 },
  [PoolType.StableSurge]: { label: 'Stable Surge', maxTokens: 5 },
  [PoolType.Weighted]: { label: 'Weighted', maxTokens: 8 },
  [PoolType.GyroE]: { label: 'Gyro Elliptic CLP', maxTokens: 2 },
  [PoolType.ReClamm]: { label: 'reClamm', maxTokens: 2 },
}

export const PROTOCOLS = [
  {
    id: ProjectConfigBalancer.projectId,
    name: ProjectConfigBalancer.projectName,
    imageSrc: ProjectConfigBalancer.projectLogo,
  },
  {
    id: ProjectConfigBeets.projectId,
    name: ProjectConfigBeets.projectName,
    imageSrc: ProjectConfigBeets.projectLogo,
  },
]

export enum WeightedPoolStructure {
  FiftyFifty = '50/50',
  EightyTwenty = '80/20',
  Custom = 'custom',
}

export const WEIGHTED_POOL_STRUCTURES = [
  WeightedPoolStructure.FiftyFifty,
  WeightedPoolStructure.EightyTwenty,
  WeightedPoolStructure.Custom,
] as const

export enum RateProviderOption {
  Verified = 'verified',
  Custom = 'custom',
  Null = 'null',
}

export const RATE_PROVIDER_RADIO_OPTIONS = [
  {
    label: 'Add the verified rate provider for this token: ',
    value: RateProviderOption.Verified,
  },
  {
    label: 'Add custom rate provider',
    value: RateProviderOption.Custom,
  },
  {
    label: 'No rate provider',
    value: RateProviderOption.Null,
  },
] as const

export const INITIAL_TOKEN_CONFIG: PoolCreationToken = {
  address: undefined,
  rateProvider: zeroAddress,
  paysYieldFees: false,
  data: undefined,
  amount: '',
  weight: '',
}

export const INITIAL_POOL_TOKENS = [INITIAL_TOKEN_CONFIG, INITIAL_TOKEN_CONFIG]

export const INITIAL_POOL_CREATION_FORM: PoolCreationForm = {
  protocol: PROJECT_CONFIG.projectId,
  network: PROJECT_CONFIG.defaultNetwork,
  weightedPoolStructure: WeightedPoolStructure.FiftyFifty,
  poolType: PoolType.Stable,
  poolTokens: INITIAL_POOL_TOKENS,
  name: '',
  symbol: '',
  swapFeeManager: zeroAddress,
  pauseManager: zeroAddress,
  swapFeePercentage: getSwapFeePercentageOptions(PoolType.Weighted)[0].value,
  amplificationParameter: AMPLIFICATION_PARAMETER_OPTIONS[0],
  poolHooksContract: zeroAddress,
  enableDonation: false,
  disableUnbalancedLiquidity: false,
  hasAcceptedTokenWeightsRisk: false,
  hasAcceptedPoolCreationRisk: false,
  hasAcceptedSimilarPoolsWarning: false,
}

export const INITIAL_RECLAMM_CONFIG: ReClammConfig = {
  initialTargetPrice: '',
  initialMinPrice: '',
  initialMaxPrice: '',
  priceRangePercentage: '',
  priceShiftDailyRate: '',
  centerednessMargin: '',
}

export const INITIAL_ECLP_CONFIG: EclpConfigForm = {
  alpha: '',
  beta: '',
  c: '',
  s: '',
  lambda: '',
  peakPrice: '',
}

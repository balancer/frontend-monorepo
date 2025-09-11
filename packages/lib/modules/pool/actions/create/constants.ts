import { PoolType, STABLE_POOL_CONSTRAINTS } from '@balancer/sdk'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { zeroAddress } from 'viem'
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { SupportedPoolTypes, PoolTypeDetails, PoolCreationToken, PoolCreationForm } from './types'

export const PERCENTAGE_DECIMALS = 16
export const MAX_POOL_NAME_LENGTH = 32
export const MAX_POOL_SYMBOL_LENGTH = 26
export const MAX_SWAP_FEE_PERCENTAGE = 10
export const REQUIRED_TOTAL_WEIGHT = 100
export const AMPLIFICATION_PARAMETER_OPTIONS = ['100', '1000']
export const MIN_AMPLIFICATION_PARAMETER = Number(STABLE_POOL_CONSTRAINTS.MIN_AMP)
export const MAX_AMPLIFICATION_PARAMETER = Number(STABLE_POOL_CONSTRAINTS.MAX_AMP)

const MIN_SWAP_FEE_WEIGHTED = 0.001
const MIN_SWAP_FEE_STABLE = 0.0001

export const POOL_TYPES: Record<SupportedPoolTypes, PoolTypeDetails> = {
  [PoolType.Weighted]: { label: 'Weighted', maxTokens: 8 },
  [PoolType.Stable]: { label: 'Stable', maxTokens: 5 },
  [PoolType.StableSurge]: { label: 'Stable Surge', maxTokens: 5 },
  // [PoolType.GyroE]: { label: 'Gyro Elliptic CLP', maxTokens: 2 },
  // [PoolType.ReClamm]: { label: 'reClamm', maxTokens: 2 },
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

const STABLE_SWAP_FEE_PERCENTAGE_OPTIONS = [
  { value: '0.01', tip: 'Best for super stable pairs' },
  { value: '0.05', tip: 'Best for stable-ish pairs' },
]

export const SWAP_FEE_PERCENTAGE_OPTIONS: Record<
  SupportedPoolTypes,
  { value: string; tip: string }[]
> = {
  [PoolType.Weighted]: [
    { value: '0.30', tip: 'Best for most weighted pairs' },
    { value: '1.00', tip: 'Best for exotic pairs' },
  ],
  [PoolType.Stable]: STABLE_SWAP_FEE_PERCENTAGE_OPTIONS,
  [PoolType.StableSurge]: STABLE_SWAP_FEE_PERCENTAGE_OPTIONS,
}

export const MIN_SWAP_FEE_PERCENTAGE = {
  [PoolType.Weighted]: MIN_SWAP_FEE_WEIGHTED,
  [PoolType.Stable]: MIN_SWAP_FEE_STABLE,
  [PoolType.StableSurge]: MIN_SWAP_FEE_STABLE,
}

export const INITIAL_TOKEN_CONFIG: PoolCreationToken = {
  address: undefined,
  rateProvider: zeroAddress,
  paysYieldFees: false,
  data: undefined,
  amount: '',
  weight: '',
}

export const INITIAL_POOL_CREATION_FORM: PoolCreationForm = {
  protocol: ProjectConfigBalancer.projectId,
  network: GqlChain.Mainnet,
  weightedPoolStructure: WeightedPoolStructure.FiftyFifty,
  poolType: PoolType.Weighted,
  poolTokens: [INITIAL_TOKEN_CONFIG, INITIAL_TOKEN_CONFIG],
  name: '',
  symbol: '',
  swapFeeManager: zeroAddress,
  pauseManager: zeroAddress,
  swapFeePercentage: SWAP_FEE_PERCENTAGE_OPTIONS[PoolType.Weighted][0].value,
  amplificationParameter: AMPLIFICATION_PARAMETER_OPTIONS[0],
  poolHooksContract: zeroAddress,
  enableDonation: false,
  disableUnbalancedLiquidity: false,
  hasAcceptedTokenWeightsRisk: false,
  hasAcceptedPoolCreationRisk: false,
}

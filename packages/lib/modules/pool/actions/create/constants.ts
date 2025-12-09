import { PoolType, STABLE_POOL_CONSTRAINTS } from '@balancer/sdk'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { zeroAddress, Address } from 'viem'
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
import { GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

const GNOSIS_BLACKLIST: Address[] = [
  '0xcB444e90D8198415266c6a2724b7900fb12FC56E', // Monerium EUR emoney (EURe)
  '0x417bc5b940475203A18C2f320a5ba470D6c5E463', // Wrapped Aave Gnosis EURe (waGnoEURe)
  '0x420CA0f9B9b604cE0fd9C18EF134C705e5Fa3430', //Monerium EURe (EURe)
]

export const TOKEN_BLACKLIST: Partial<Record<GqlChain, Set<string>>> = {
  [GqlChain.Gnosis]: new Set(GNOSIS_BLACKLIST.map(addr => addr.toLowerCase())),
}

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
  [PoolType.Stable]: {
    label: 'Stable',
    maxTokens: 5,
    description:
      'Stable Pools are optimal for assets expected to consistently trade at near parity or with a known exchange rate. Stable Pools allows for swaps of significant size before encountering substantial price impact, vastly increasing capital efficiency for like-kind and correlated-kind swaps.',
  },
  [PoolType.StableSurge]: {
    label: 'Stable Surge',
    maxTokens: 5,
    description:
      'A Stable Pool with a “Stable Surge” hook that applies a dynamic directional surge swap fee in times of volatility to help defend the peg. LPs get MEV protection and increased fees.',
  },
  [PoolType.Weighted]: {
    label: 'Weighted',
    maxTokens: 8,
    description:
      'Weighted Pools are highly versatile and configurable pools. They are ideal for general cases and enable users to build pools with different token counts and weightings.',
  },
  [PoolType.GyroE]: {
    label: 'Gyro Elliptic CLP',
    maxTokens: 2,
    description:
      'Concentrated liquidity pools that use an elliptical price curve to focus liquidity asymmetrically within customizable bounds. E-CLPs provide deeper liquidity and lower slippage for trades while maximizing LP capital efficiency within expected price ranges.',
  },
  [PoolType.ReClamm]: {
    label: 'reCLAMM',
    maxTokens: 2,
    description:
      'A concentrated liquidity pool with self-adjusting parameters. A "fire-and-forget" solution to maintenance-free concentrated liquidity provision.',
  },
}

export const PROTOCOLS = [
  {
    name: 'Balancer v3',
    imageSrc: ProjectConfigBalancer.projectLogo,
  },
  {
    name: 'CoW',
    imageSrc: '/images/protocols/cowamm.svg',
  },
] as const

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
    label: 'No rate provider',
    value: RateProviderOption.Null,
  },
  {
    label: 'Add the verified rate provider for this token: ',
    value: RateProviderOption.Verified,
  },
  {
    label: 'Add custom rate provider',
    value: RateProviderOption.Custom,
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
  protocol: PROTOCOLS[0].name,
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

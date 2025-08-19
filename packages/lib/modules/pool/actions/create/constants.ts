import { PoolType } from '@balancer/sdk'
import { ProjectConfigBalancer } from '@repo/lib/config/projects/balancer'
import { ProjectConfigBeets } from '@repo/lib/config/projects/beets'
import { PoolCreationToken } from './PoolCreationFormProvider'
import { zeroAddress } from 'viem'
import { TokenType } from '@balancer/sdk'

export const POOL_CONFIGURATION_STEPS = [
  { id: 'step1', title: 'Type' },
  { id: 'step2', title: 'Tokens' },
  { id: 'step3', title: 'Details' },
  { id: 'step4', title: 'Fund' },
]

export type SupportedPoolTypes = PoolType.Stable | PoolType.Weighted | PoolType.StableSurge
// | PoolType.GyroE
// | PoolType.ReClamm

type PoolTypeDetails = {
  label: string
  maxTokens: number
}

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

export const DEFAULT_TOKEN: PoolCreationToken = {
  config: {
    address: zeroAddress, // TODO: validate config.address != zeroAddress
    rateProvider: zeroAddress,
    paysYieldFees: false,
    tokenType: TokenType.STANDARD,
    weight: '',
  },
  data: undefined,
  amount: '',
}

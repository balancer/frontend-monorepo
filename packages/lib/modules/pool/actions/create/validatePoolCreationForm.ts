import { isAddress } from 'viem'
import {
  MIN_SWAP_FEE_PERCENTAGE,
  MAX_SWAP_FEE_PERCENTAGE,
  MIN_AMPLIFICATION_PARAMETER,
  MAX_AMPLIFICATION_PARAMETER,
  MAX_POOL_NAME_LENGTH,
  MAX_POOL_SYMBOL_LENGTH,
  WeightedPoolStructure,
  SupportedPoolTypes,
  POOL_TYPES,
  REQUIRED_TOTAL_WEIGHT,
  type PoolCreationToken,
} from './constants'
import { PoolType } from '@balancer/sdk'

export const validatePoolTokens = {
  maxTokens: (poolType: SupportedPoolTypes) => {
    return POOL_TYPES[poolType].maxTokens
  },

  isAtMaxTokens: (poolType: SupportedPoolTypes, tokens: PoolCreationToken[]) => {
    return tokens.length === validatePoolTokens.maxTokens(poolType)
  },

  singleTokenWeight: (weight: number, poolType: SupportedPoolTypes) => {
    if (!validatePoolType.isWeightedPool(poolType)) return true
    if (weight < 1) return 'Minimum weight for each token is 1%'
    if (weight > 99) return 'Maximum weight for a token is 99%'
    return true
  },

  totalWeight: (poolTokens: PoolCreationToken[]) => {
    return poolTokens.reduce((acc, token) => acc + Number(token.weight), 0)
  },

  isAllWeightInputsPopulated: (poolTokens: PoolCreationToken[]) => {
    return poolTokens.every(token => token.weight)
  },

  isTotalWeightTooLow: (poolTokens: PoolCreationToken[]) => {
    const isAllWeightInputsPopulated = validatePoolTokens.isAllWeightInputsPopulated(poolTokens)
    const totalWeight = validatePoolTokens.totalWeight(poolTokens)
    return isAllWeightInputsPopulated && totalWeight < REQUIRED_TOTAL_WEIGHT
  },

  isTotalWeightTooHigh: (poolTokens: PoolCreationToken[]) => {
    return validatePoolTokens.totalWeight(poolTokens) > REQUIRED_TOTAL_WEIGHT
  },

  isValidTotalWeight: (poolTokens: PoolCreationToken[]) => {
    return validatePoolTokens.totalWeight(poolTokens) === REQUIRED_TOTAL_WEIGHT
  },

  isValidTokenWeights: (poolType: SupportedPoolTypes, poolTokens: PoolCreationToken[]) => {
    const isWeightedPool = validatePoolType.isWeightedPool(poolType)
    const isValidTotalWeight = validatePoolTokens.isValidTotalWeight(poolTokens)
    return !isWeightedPool || isValidTotalWeight
  },

  rateProvider: (address: string, isValidationPending: boolean, isValidRateProvider: boolean) => {
    if (address === '') return false
    if (isValidationPending) return true
    if (!isAddress(address)) return 'Invalid address'
    if (!isValidRateProvider) return 'Invalid rate provider address'
    return true
  },
}

export const validatePoolType = {
  isWeightedPool: (poolType: SupportedPoolTypes) => {
    return poolType === PoolType.Weighted
  },

  isCustomWeightedPool: (
    poolType: SupportedPoolTypes,
    weightedPoolStructure: WeightedPoolStructure
  ) => {
    return poolType === PoolType.Weighted && weightedPoolStructure === WeightedPoolStructure.Custom
  },

  isStablePool: (poolType: SupportedPoolTypes) => {
    return poolType === PoolType.Stable || poolType === PoolType.StableSurge
  },

  isStableSurgePool: (poolType: SupportedPoolTypes) => {
    return poolType === PoolType.StableSurge
  },
}

export const validatePoolSettings = {
  pauseManager: (address: string) => {
    if (!isAddress(address)) return 'Invalid address'
    return true
  },

  swapFeeManager: (address: string) => {
    if (!isAddress(address)) return 'Invalid address'
    return true
  },

  swapFeePercentage: (value: string, poolType: SupportedPoolTypes) => {
    const numValue = Number(value)
    if (numValue < MIN_SWAP_FEE_PERCENTAGE[poolType] || numValue > MAX_SWAP_FEE_PERCENTAGE)
      return `Value must be between ${MIN_SWAP_FEE_PERCENTAGE[poolType]} and ${MAX_SWAP_FEE_PERCENTAGE}`
    return true
  },

  amplificationParameter: (value: string) => {
    const numValue = Number(value)
    if (numValue < MIN_AMPLIFICATION_PARAMETER || numValue > MAX_AMPLIFICATION_PARAMETER)
      return `Value must be between ${MIN_AMPLIFICATION_PARAMETER} and ${MAX_AMPLIFICATION_PARAMETER}`
    return true
  },

  poolHooksContract: (
    address: string,
    isValidPoolHooksContract: boolean,
    isValidationPending: boolean
  ) => {
    if (address === '') return false
    if (isValidationPending) return true
    if (!isAddress(address)) return 'Invalid address'
    if (!isValidPoolHooksContract) return 'Invalid hooks contract address'
    return true
  },
}

export const validatePoolDetails = {
  name: (name: string) => {
    if (name.length < 3) return 'Pool name must be 3 characters or more'
    if (name.length > MAX_POOL_NAME_LENGTH)
      return `Pool name must be ${MAX_POOL_NAME_LENGTH} characters or less`
    return true
  },

  symbol: (symbol: string) => {
    if (symbol.length < 3) return 'Pool symbol must be 3 characters or more'
    if (symbol.length > MAX_POOL_SYMBOL_LENGTH)
      return `Pool symbol must be ${MAX_POOL_SYMBOL_LENGTH} characters or less`
    return true
  },
}

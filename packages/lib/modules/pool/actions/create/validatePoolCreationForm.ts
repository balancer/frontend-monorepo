import { isAddress, zeroAddress } from 'viem'
import {
  MIN_SWAP_FEE_PERCENTAGE,
  MAX_SWAP_FEE_PERCENTAGE,
  MIN_AMPLIFICATION_PARAMETER,
  MAX_AMPLIFICATION_PARAMETER,
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
    value: string,
    isValidPoolHooksContract: boolean | undefined,
    isLoadingPoolHooksContract: boolean
  ) => {
    if (value === '') return false
    if (value === zeroAddress) return true
    if (isLoadingPoolHooksContract) return true
    if (value && !isAddress(value)) return 'Invalid address'
    if (value && !isValidPoolHooksContract) return 'Invalid pool hooks contract'
    return true
  },
}

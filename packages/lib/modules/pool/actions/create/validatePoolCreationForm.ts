import {
  MAX_SWAP_FEE_PERCENTAGE,
  MIN_AMPLIFICATION_PARAMETER,
  MAX_AMPLIFICATION_PARAMETER,
  MAX_POOL_NAME_LENGTH,
  MAX_POOL_SYMBOL_LENGTH,
  POOL_TYPES,
  REQUIRED_TOTAL_WEIGHT,
} from './constants'
import { getMinSwapFeePercentage, isWeightedPool, isCowPool } from './helpers'
import { PoolCreationToken, SupportedPoolTypes } from './types'
import { parseUnits, isAddress } from 'viem'
import { PoolType } from '@balancer/sdk'

const LESS_THAN_0_ERROR = 'Amount must be greater than 0'
const LESS_THAN_1_ERROR = 'Minimum amount is 1'

export const validatePoolTokens = {
  isValidTokens: (poolTokens: PoolCreationToken[]) => {
    return poolTokens.every(token => token.address)
  },

  maxTokens: (poolType: SupportedPoolTypes) => {
    return POOL_TYPES[poolType].maxTokens
  },

  isAtMaxTokens: (poolType: SupportedPoolTypes, tokens: PoolCreationToken[]) => {
    return tokens.length === validatePoolTokens.maxTokens(poolType)
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
    const isValidTotalWeight = validatePoolTokens.isValidTotalWeight(poolTokens)
    return !isWeightedPool(poolType) || isValidTotalWeight
  },

  hasAmountError(
    token: PoolCreationToken,
    poolType: PoolType
  ): { error: string | undefined; possibleErrors: string[] } {
    const possibleErrors = [LESS_THAN_0_ERROR, LESS_THAN_1_ERROR]

    if (!token.address) return { error: undefined, possibleErrors }
    if (token.amount === '') return { error: undefined, possibleErrors }

    if (Number(token.amount) === 0) return { error: LESS_THAN_0_ERROR, possibleErrors }

    // CoW amm on v1 has special amount requirement based on token decimals
    const tokenDecimals = token.data?.decimals || 0
    const rawAmount = parseUnits(token.amount, tokenDecimals)
    const isInvalidAmountForCowPool =
      isCowPool(poolType) && tokenDecimals < 18 && rawAmount < BigInt(1e6)
    if (isInvalidAmountForCowPool) return { error: LESS_THAN_1_ERROR, possibleErrors }

    return { error: undefined, possibleErrors }
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
    const minSwapFeePercentage = getMinSwapFeePercentage(poolType)
    if (numValue < minSwapFeePercentage || numValue > MAX_SWAP_FEE_PERCENTAGE) {
      return `Value must be between ${minSwapFeePercentage} and ${MAX_SWAP_FEE_PERCENTAGE}`
    }
    return true
  },

  amplificationParameter: (value: string) => {
    const numValue = Number(value)
    if (numValue < MIN_AMPLIFICATION_PARAMETER || numValue > MAX_AMPLIFICATION_PARAMETER) {
      return `Value must be between ${MIN_AMPLIFICATION_PARAMETER} and ${MAX_AMPLIFICATION_PARAMETER}`
    }
    return true
  },
}

export const validatePoolDetails = {
  name: (name: string) => {
    if (name.length < 3) return 'Pool name must be 3 characters or more'
    if (name.length > MAX_POOL_NAME_LENGTH) {
      return `Pool name must be ${MAX_POOL_NAME_LENGTH} characters or less`
    }
    return true
  },

  symbol: (symbol: string) => {
    if (symbol.length < 3) return 'Pool symbol must be 3 characters or more'
    if (symbol.length > MAX_POOL_SYMBOL_LENGTH) {
      return `Pool symbol must be ${MAX_POOL_SYMBOL_LENGTH} characters or less`
    }
    return true
  },
}

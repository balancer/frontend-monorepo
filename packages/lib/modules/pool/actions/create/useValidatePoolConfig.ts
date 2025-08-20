import { usePoolCreationForm } from './PoolCreationFormProvider'
import { PoolType } from '@balancer/sdk'
import { POOL_TYPES, WeightedPoolStructure } from './constants'

const REQUIRED_TOTAL_WEIGHT = 100

export function useValidatePoolConfig() {
  const { poolType, poolTokens, weightedPoolStructure } = usePoolCreationForm()

  const isWeightedPool = poolType === PoolType.Weighted
  const isCustomWeightedPool =
    isWeightedPool && weightedPoolStructure === WeightedPoolStructure.Custom
  const isStablePool = poolType === PoolType.Stable
  const isStableSurgePool = poolType === PoolType.StableSurge

  const maxTokenCount = POOL_TYPES[poolType].maxTokens
  const isAtMaxTokenCount = poolTokens.length === maxTokenCount

  const totalWeight = poolTokens.reduce((acc, token) => acc + Number(token.weight), 0)
  const isAllWeightInputsPopulated = poolTokens.every(token => token.weight)
  const isTotalWeightTooLow = isAllWeightInputsPopulated && totalWeight < REQUIRED_TOTAL_WEIGHT
  const isTotalWeightTooHigh = totalWeight > REQUIRED_TOTAL_WEIGHT
  const isValidTotalWeight = totalWeight === REQUIRED_TOTAL_WEIGHT

  const isValidTokenWeights = !isWeightedPool || isValidTotalWeight
  const isValidPoolTokens = poolTokens.every(token => token.address)

  const isPoolTokensStepValid = isValidPoolTokens && isValidTokenWeights

  return {
    isStablePool,
    isStableSurgePool,
    isWeightedPool,
    isCustomWeightedPool,
    totalWeight,
    isTotalWeightTooLow,
    isTotalWeightTooHigh,
    isValidTotalWeight,
    isAtMaxTokenCount,
    maxTokenCount,
    isPoolTokensStepValid,
  }
}

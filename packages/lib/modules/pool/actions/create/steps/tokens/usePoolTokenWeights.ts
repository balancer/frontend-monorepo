import { usePoolCreationConfig } from '../../usePoolCreationConfig'

export function usePoolTokenWeights() {
  const { poolTokens } = usePoolCreationConfig()

  const totalWeight = poolTokens.reduce((acc, token) => acc + Number(token.config.weight), 0)
  const isAllValidWeightInputs = poolTokens.every(token => token.config.weight)
  const isTotalWeightTooLow = isAllValidWeightInputs && totalWeight < 100
  const isTotalWeightTooHigh = totalWeight > 100
  const isInvalidTotalWeight = isTotalWeightTooLow || isTotalWeightTooHigh

  const totalWeightColor = isTotalWeightTooLow
    ? 'font.warning'
    : isTotalWeightTooHigh
      ? 'font.error'
      : 'font.maxContrast'

  return {
    totalWeight,
    isAllValidWeightInputs,
    isTotalWeightTooLow,
    isTotalWeightTooHigh,
    isInvalidTotalWeight,
    totalWeightColor,
  }
}

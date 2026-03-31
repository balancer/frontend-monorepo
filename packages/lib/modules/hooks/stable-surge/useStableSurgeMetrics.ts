import { Pool } from '../../pool/pool.types'
import { GqlHookType, StableSurgeHookParams } from '@repo/lib/shared/services/api/generated/graphql'
import { useGetPoolTokensWithActualWeights } from '../../pool/useGetPoolTokensWithActualWeights'

export function useStableSurgeMetrics(pool: Pool) {
  const { poolTokensWithActualWeights } = useGetPoolTokensWithActualWeights(pool)

  if (!pool.hook || pool.hook.type !== GqlHookType.StableSurge) return { surging: false }

  const percentages = Object.values(poolTokensWithActualWeights).map(p => parseFloat(p))
  const totalImbalance = calculateTotalImbalance(percentages)

  const hookParams = pool.hook.params as StableSurgeHookParams
  const surgeThreshold = parseFloat(hookParams.surgeThresholdPercentage || '0')

  return {
    surging: totalImbalance > surgeThreshold,
  }
}

function calculateMedian(percentages: number[]) {
  const sortedPercentages = [...percentages].sort((a, b) => a - b)
  const mid = Math.floor(sortedPercentages.length / 2)
  return sortedPercentages.length % 2 === 0
    ? (sortedPercentages[mid - 1] + sortedPercentages[mid]) / 2
    : sortedPercentages[mid]
}

function calculateTotalImbalance(percentages: number[]) {
  const median = calculateMedian(percentages)

  return percentages.reduce((sum, percentage) => sum + Math.abs(percentage - median), 0)
}

import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { now } from '@repo/lib/shared/utils/time'
import { isAfter, isBefore, secondsToMilliseconds } from 'date-fns'

export function hasSaleStarted(pool: GqlPoolLiquidityBootstrappingV3) {
  const startTime = new Date(secondsToMilliseconds(pool.startTime))
  const currentTime = now()

  return isAfter(currentTime, startTime)
}

export function hasSaleFinished(pool: GqlPoolLiquidityBootstrappingV3) {
  const endTime = new Date(secondsToMilliseconds(pool.endTime))
  const currentTime = now()

  return isAfter(currentTime, endTime)
}

export function isSaleOngoing(pool: GqlPoolLiquidityBootstrappingV3) {
  const startTime = new Date(secondsToMilliseconds(pool.startTime))
  const endTime = new Date(secondsToMilliseconds(pool.endTime))
  const currentTime = now()

  return isAfter(currentTime, startTime) && isBefore(currentTime, endTime)
}

import { PoolType } from '@balancer/sdk'
import { bn } from '@repo/lib/shared/utils/numbers'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { fNumCustom } from '@repo/lib/shared/utils/numbers'
import { WeightedPoolStructure } from './constants'

const sdkToGqlPoolType: Partial<Record<PoolType, GqlPoolType>> = {
  [PoolType.Weighted]: GqlPoolType.Weighted,
  [PoolType.Stable]: GqlPoolType.Stable,
  [PoolType.StableSurge]: GqlPoolType.Stable,
  [PoolType.GyroE]: GqlPoolType.Gyroe,
  [PoolType.ReClamm]: GqlPoolType.Reclamm,
  [PoolType.CowAmm]: GqlPoolType.CowAmm,
}

export function getGqlPoolType(poolType: PoolType): GqlPoolType {
  const gqlPoolType = sdkToGqlPoolType[poolType]
  if (!gqlPoolType) throw new Error(`Invalid pool type: ${poolType}`)
  return gqlPoolType
}

export function getSwapFeePercentageOptions(poolType: PoolType): { value: string; tip: string }[] {
  const isStablePool = poolType === PoolType.Stable || poolType === PoolType.StableSurge
  if (isStablePool) {
    return [
      { value: '0.01', tip: 'Best for super stable pairs' },
      { value: '0.05', tip: 'Best for stable-ish pairs' },
    ]
  } else if (poolType === PoolType.Weighted) {
    return [
      { value: '0.30', tip: 'Best for most weighted pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ]
  } else if (poolType === PoolType.GyroE) {
    return [
      { value: '0.30', tip: 'Best for most Gyro E-CLP pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ]
  } else {
    return [
      { value: '0.30', tip: 'Best for most reCLAMM pairs' },
      { value: '1.00', tip: 'Best for exotic pairs' },
    ]
  }
}

export function getMinSwapFeePercentage(poolType: PoolType): number {
  if (poolType === PoolType.Stable || poolType === PoolType.StableSurge) {
    return 0.0001
  } else {
    return 0.001
  }
}

export function getPercentFromPrice(value: string, price: string) {
  if (!value) return '0.00'
  return bn(value).minus(price).div(price).times(100).toFixed(2)
}

export const formatNumber = (value: string) => {
  let numFormat = '0.000000'
  if (Number(value) > 1000) numFormat = '0,000.00'
  if (Number(value) > 100000) numFormat = '0,000'

  return fNumCustom(value, numFormat)
}

export function isStablePool(poolType: PoolType): boolean {
  return poolType === PoolType.Stable || poolType === PoolType.StableSurge
}

export function isStableSurgePool(poolType: PoolType): boolean {
  return poolType === PoolType.StableSurge
}

export function isWeightedPool(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted
}

export function isCustomWeightedPool(
  poolType: PoolType,
  weightedPoolStructure: WeightedPoolStructure
): boolean {
  return poolType === PoolType.Weighted && weightedPoolStructure === WeightedPoolStructure.Custom
}

export function isReClammPool(poolType: PoolType): boolean {
  return poolType === PoolType.ReClamm
}

export function isGyroEllipticPool(poolType: PoolType): boolean {
  return poolType === PoolType.GyroE
}

export function isCowPool(poolType: PoolType): boolean {
  return poolType === PoolType.CowAmm
}

export function isCowProtocol(protocol: string): boolean {
  return protocol === 'CoW'
}

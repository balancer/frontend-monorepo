import { PoolType } from '@balancer/sdk'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

const sdkToGqlPoolType: Partial<Record<PoolType, GqlPoolType>> = {
  [PoolType.Weighted]: GqlPoolType.Weighted,
  [PoolType.Stable]: GqlPoolType.Stable,
  [PoolType.StableSurge]: GqlPoolType.Stable,
  [PoolType.GyroE]: GqlPoolType.Gyroe,
  [PoolType.ReClamm]: GqlPoolType.Reclamm,
}

export function getGqlPoolType(poolType: PoolType): GqlPoolType {
  const gqlPoolType = sdkToGqlPoolType[poolType]
  if (!gqlPoolType) throw new Error(`Invalid pool type: ${poolType}`)
  return gqlPoolType
}

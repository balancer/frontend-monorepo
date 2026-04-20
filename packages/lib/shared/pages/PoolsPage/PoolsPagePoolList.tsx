import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import {
  GetPoolsQueryVariables,
  GqlChain,
  GqlPoolType,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PoolList as PoolListType } from '@repo/lib/modules/pool/pool.types'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export function PoolsPagePoolList({
  fixedPoolTypes,
  fixedChains,
  initialPools,
  initialCount,
  initialQueryVariables,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  initialPools?: PoolListType
  initialCount?: number
  initialQueryVariables?: GetPoolsQueryVariables
}) {
  return (
    <NuqsAdapter>
      <PoolList
        fixedChains={fixedChains}
        fixedPoolTypes={fixedPoolTypes}
        initialCount={initialCount}
        initialPools={initialPools}
        initialQueryVariables={initialQueryVariables}
      />
    </NuqsAdapter>
  )
}

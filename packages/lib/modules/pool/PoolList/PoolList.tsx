'use client'

import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import {
  GetPoolsQueryVariables,
  GqlPoolType,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'
import { PoolList as PoolListType } from '../pool.types'

export function PoolList({
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
    <PoolListProvider
      fixedChains={fixedChains}
      fixedPoolTypes={fixedPoolTypes}
      initialCount={initialCount}
      initialPools={initialPools}
      initialQueryVariables={initialQueryVariables}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

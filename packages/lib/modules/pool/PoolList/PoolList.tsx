'use client'

import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import {
  GqlPoolType,
  GqlChain,
  GetPoolsQuery,
} from '@repo/lib/shared/services/api/generated/graphql'

export function PoolList({
  fixedPoolTypes,
  fixedChains,
  initialPoolsData,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  initialPoolsData?: GetPoolsQuery
}) {
  return (
    <PoolListProvider
      fixedChains={fixedChains}
      fixedPoolTypes={fixedPoolTypes}
      initialPoolsData={initialPoolsData}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

'use client'

import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import {
  GetPoolsQuery,
  GqlPoolType,
  GqlChain,
} from '@repo/lib/shared/services/api/generated/graphql'

export function PoolList({
  fixedPoolTypes,
  fixedChains,
  serverData,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  serverData?: GetPoolsQuery | null
}) {
  return (
    <PoolListProvider
      fixedChains={fixedChains}
      fixedPoolTypes={fixedPoolTypes}
      serverData={serverData}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

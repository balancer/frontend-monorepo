'use client'

import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { QueryRef } from '@apollo/client/react'

export function PoolList({
  fixedPoolTypes,
  fixedChains,
  initialQueryRef,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
  initialQueryRef?: QueryRef<any, any>
}) {
  return (
    <PoolListProvider
      fixedChains={fixedChains}
      fixedPoolTypes={fixedPoolTypes}
      initialQueryRef={initialQueryRef}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

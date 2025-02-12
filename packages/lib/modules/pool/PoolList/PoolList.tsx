import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'

export async function PoolList({
  fixedPoolTypes,
  fixedChains,
}: {
  fixedPoolTypes?: GqlPoolType[]
  fixedChains?: GqlChain[]
}) {
  return (
    <PoolListProvider fixedChains={fixedChains} fixedPoolTypes={fixedPoolTypes}>
      <PoolListLayout />
    </PoolListProvider>
  )
}

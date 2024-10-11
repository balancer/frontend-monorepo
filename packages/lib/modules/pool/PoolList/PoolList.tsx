import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'

export async function PoolList({ fixedPoolTypes }: { fixedPoolTypes?: GqlPoolType[] }) {
  return (
    <PoolListProvider fixedPoolTypes={fixedPoolTypes}>
      <PoolListLayout />
    </PoolListProvider>
  )
}

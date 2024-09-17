import { PoolListProvider } from '@/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@/lib/shared/services/api/generated/graphql'

export async function PoolList({ fixedPoolTypes }: { fixedPoolTypes?: GqlPoolType[] }) {
  return (
    <PoolListProvider fixedPoolTypes={fixedPoolTypes}>
      <PoolListLayout />
    </PoolListProvider>
  )
}

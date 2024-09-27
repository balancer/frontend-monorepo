import { PoolListProvider } from './PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '../../../shared/services/api/generated/graphql'

export async function PoolList({ fixedPoolTypes }: { fixedPoolTypes?: GqlPoolType[] }) {
  return (
    <PoolListProvider fixedPoolTypes={fixedPoolTypes}>
      <PoolListLayout />
    </PoolListProvider>
  )
}

import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListDisplayType } from '../pool.types'

export async function PoolList({
  displayType,
  fixedPoolTypes,
  filterProtocolVersion,
}: {
  displayType?: PoolListDisplayType
  fixedPoolTypes?: GqlPoolType[]
  filterProtocolVersion?: string[]
}) {
  return (
    <PoolListProvider
      displayType={displayType}
      filterProtocolVersion={filterProtocolVersion}
      fixedPoolTypes={fixedPoolTypes}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

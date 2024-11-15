import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListDisplayType } from '../pool.types'

export async function PoolList({
  displayType,
  fixedPoolTypes,
  hideProtocolVersion,
}: {
  displayType?: PoolListDisplayType
  fixedPoolTypes?: GqlPoolType[]
  hideProtocolVersion?: string[]
}) {
  return (
    <PoolListProvider
      displayType={displayType}
      fixedPoolTypes={fixedPoolTypes}
      hideProtocolVersion={hideProtocolVersion}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

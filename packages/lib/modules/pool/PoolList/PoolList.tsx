import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListDisplayType } from '../pool.types'

export async function PoolList({
  displayType,
  fixedPoolTypes,
  hideProtocolVersion,
  hidePoolTypes,
  hidePoolTags,
}: {
  displayType?: PoolListDisplayType
  fixedPoolTypes?: GqlPoolType[]
  hideProtocolVersion?: string[]
  hidePoolTypes?: GqlPoolType[]
  hidePoolTags?: string[]
}) {
  return (
    <PoolListProvider
      displayType={displayType}
      fixedPoolTypes={fixedPoolTypes}
      hidePoolTags={hidePoolTags}
      hidePoolTypes={hidePoolTypes}
      hideProtocolVersion={hideProtocolVersion}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

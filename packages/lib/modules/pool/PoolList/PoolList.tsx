import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListDisplayType } from '../pool.types'

export async function PoolList({
  fixedPoolTypes,
  displayType = PoolListDisplayType.TokenPills,
  hideProtocolVersion = [],
  hidePoolTypes = [],
  hidePoolTags = [],
  showPoolCreator = false,
}: {
  displayType?: PoolListDisplayType
  fixedPoolTypes?: GqlPoolType[]
  hideProtocolVersion?: string[]
  hidePoolTypes?: GqlPoolType[]
  hidePoolTags?: string[]
  showPoolCreator?: boolean
}) {
  return (
    <PoolListProvider
      displayType={displayType}
      fixedPoolTypes={fixedPoolTypes}
      hidePoolTags={hidePoolTags}
      hidePoolTypes={hidePoolTypes}
      hideProtocolVersion={hideProtocolVersion}
      showPoolCreator={showPoolCreator}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

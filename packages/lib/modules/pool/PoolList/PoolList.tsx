import { PoolListProvider } from '@repo/lib/modules/pool/PoolList/PoolListProvider'
import { PoolListLayout } from './PoolListLayout'
import { GqlPoolType, GqlChain } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolListDisplayType } from '../pool.types'

export async function PoolList({
  fixedPoolTypes,
  displayType = PoolListDisplayType.TokenPills,
  hideProtocolVersion = [],
  hidePoolTypes = [],
  hidePoolTags = [],
  fixedChains,
}: {
  displayType?: PoolListDisplayType
  fixedPoolTypes?: GqlPoolType[]
  hideProtocolVersion?: string[]
  hidePoolTypes?: GqlPoolType[]
  hidePoolTags?: string[]
  fixedChains?: GqlChain[]
}) {
  return (
    <PoolListProvider
      displayType={displayType}
      fixedChains={fixedChains}
      fixedPoolTypes={fixedPoolTypes}
      hidePoolTags={hidePoolTags}
      hidePoolTypes={hidePoolTypes}
      hideProtocolVersion={hideProtocolVersion}
    >
      <PoolListLayout />
    </PoolListProvider>
  )
}

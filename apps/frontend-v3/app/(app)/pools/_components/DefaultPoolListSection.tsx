import { PreloadQuery } from '@repo/lib/shared/services/api/apollo-server.client'
import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { poolListDefaultVariables } from '@repo/lib/modules/pool/PoolList/poolListDefaultVariables'

export async function DefaultPoolListSection() {
  return (
    <PreloadQuery query={GetPoolsDocument} variables={poolListDefaultVariables}>
      <PoolList />
    </PreloadQuery>
  )
}

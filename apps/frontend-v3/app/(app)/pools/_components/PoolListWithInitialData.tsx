import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { poolListDefaultVariables } from '@repo/lib/modules/pool/PoolList/poolListDefaultVariables'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'

export async function PoolListWithInitialData() {
  let initialPoolsData
  try {
    const { data } = await getApolloServerClient().query({
      query: GetPoolsDocument,
      variables: poolListDefaultVariables,
    })
    initialPoolsData = data
  } catch {}

  return <PoolList initialPoolsData={initialPoolsData} />
}

import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { PoolList } from '@repo/lib/modules/pool/PoolList/PoolList'
import { poolListDefaultVariables } from '@repo/lib/modules/pool/PoolList/poolListDefaultVariables'

export async function DefaultPoolListSection() {
  const { data } = await getApolloServerClient().query({
    query: GetPoolsDocument,
    variables: poolListDefaultVariables,
    context: {
      fetchOptions: {
        next: { revalidate: 60 },
      },
    },
  })

  return <PoolList initialPoolsData={data} />
}

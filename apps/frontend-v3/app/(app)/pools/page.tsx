import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { GetPoolsDocument } from '@repo/lib/shared/services/api/generated/graphql'
import { getApolloServerClient } from '@repo/lib/shared/services/api/apollo-server.client'
import { poolListDefaultVariables } from '@repo/lib/modules/pool/PoolList/poolListDefaultVariables'

export const revalidate = 60

export default async function PoolsPageWrapper() {
  let initialPoolsData = undefined
  try {
    const { data } = await getApolloServerClient().query({
      query: GetPoolsDocument,
      variables: poolListDefaultVariables,
    })
    initialPoolsData = data
  } catch {}

  return (
    <PoolsPage initialPoolsData={initialPoolsData}>
      <PromoBanners />
    </PoolsPage>
  )
}

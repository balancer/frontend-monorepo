import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { getPoolsPageData } from '@repo/lib/shared/pages/PoolsPage/poolsPage.server'

export default async function PoolsPageWrapper() {
  const { poolListData, protocolData, featuredPools, defaultPoolListQueryVariables } =
    await getPoolsPageData()

  return (
    <PoolsPage
      featuredPools={featuredPools}
      initialCount={poolListData.count}
      initialPools={poolListData.pools}
      initialQueryVariables={defaultPoolListQueryVariables}
      protocolData={protocolData}
    >
      <PromoBanners />
    </PoolsPage>
  )
}

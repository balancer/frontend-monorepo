import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'

import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'

export default async function PoolsPageWrapper() {
  return (
    <PoolsPage>
      <PromoBanners />
    </PoolsPage>
  )
}

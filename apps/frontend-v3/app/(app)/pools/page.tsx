import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'

import { BoostedPoolsPromoBanner } from '@repo/lib/shared/components/promos/BoostedPoolsPromoBanner'

export default async function PoolsPageWrapper() {
  return (
    <PoolsPage>
      <BoostedPoolsPromoBanner />
    </PoolsPage>
  )
}

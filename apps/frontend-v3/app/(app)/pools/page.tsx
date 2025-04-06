import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'

import { GyroPromoBanner } from '@repo/lib/shared/components/promos/GyroPromoBanner'

export default async function PoolsPageWrapper() {
  return (
    <PoolsPage>
      <GyroPromoBanner />
    </PoolsPage>
  )
}

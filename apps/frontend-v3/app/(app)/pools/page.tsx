import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage'

import { MevCapturePromoBanner } from '@repo/lib/shared/components/promos/MevCapturePromoBanner'

export default async function PoolsPageWrapper() {
  return (
    <PoolsPage>
      <MevCapturePromoBanner />
    </PoolsPage>
  )
}

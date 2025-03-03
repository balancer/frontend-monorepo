import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { BeetsPromoBanner } from '@/lib/components/promos/BeetsPromoBanner'

export default async function PoolsPageWrapper() {
  return (
    <PoolsPage>
      <BeetsPromoBanner />
    </PoolsPage>
  )
}

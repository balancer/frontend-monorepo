import { PoolsPage } from '@repo/lib/shared/pages/PoolsPage/PoolsPage'
import { PromoBanners } from '@repo/lib/shared/components/promos/PromoBanners'
import { Suspense } from 'react'
import { Skeleton } from '@chakra-ui/react'
import { PoolListWithInitialData } from './_components/PoolListWithInitialData'

export const revalidate = 60

export default function PoolsPageWrapper() {
  return (
    <PoolsPage
      poolListSlot={
        <Suspense fallback={<Skeleton h="500px" w="full" />}>
          <PoolListWithInitialData />
        </Suspense>
      }
    >
      <PromoBanners />
    </PoolsPage>
  )
}

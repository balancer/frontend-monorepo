'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { VStack, Stack } from '@chakra-ui/react'
import { PoolComposition } from './PoolComposition'
import { PoolInfoLayout } from './PoolInfo/PoolInfoLayout'
import { usePool } from '../PoolProvider'
import PoolMyLiquidity from './PoolMyLiquidity'
import { PoolStatsLayout } from './PoolStats/PoolStatsLayout'
import { PoolHeader } from './PoolHeader/PoolHeader'
import { PoolAlerts } from '../alerts/PoolAlerts'
import { ClaimProvider } from '../actions/claim/ClaimProvider'
import { usePoolVariant } from '../pool.hooks'
import PoolUserEvents from './PoolUserEvents/PoolUserEvents'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { CowFooter } from '@repo/lib/shared/components/navs/CowFooter'
import { CowPoolBanner } from '@repo/lib/shared/components/navs/CowPoolBanner'
import { PoolActivity } from './PoolActivity/PoolActivity'
import { PoolBanners } from './PoolBanners/PoolBanners'
import { useUserPoolEvents } from '../useUserPoolEvents'
import { hasTotalBalance } from '@repo/lib/modules/pool/user-balance.helpers'

export function PoolDetail() {
  const { pool } = usePool()
  const router = useRouter()
  const pathname = usePathname()
  const { banners } = usePoolVariant()

  const userEvents = useUserPoolEvents()

  const {
    userPoolEvents,
    isLoadingUserPoolEvents,
    hasPoolEvents: userHasPoolEvents,
  } = userEvents || {}

  const userHasLiquidity = hasTotalBalance(pool)

  useEffect(() => {
    // Prefetch pool action pages.
    router.prefetch(`${pathname}/add-liquidity`)
    if (userHasLiquidity) {
      router.prefetch(`${pathname}/remove-liquidity`)
      router.prefetch(`${pathname}/stake`)
      router.prefetch(`${pathname}/unstake`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  return (
    <>
      <DefaultPageContainer>
        <ClaimProvider pools={[pool]}>
          <VStack spacing="2xl" w="full">
            <VStack spacing="md" w="full">
              <PoolAlerts />
              <PoolHeader />
              {banners?.headerSrc && <CowPoolBanner />}

              <PoolStatsLayout />
            </VStack>
            {(userHasLiquidity || userHasPoolEvents) && (
              <Stack
                direction={{ base: 'column', xl: 'row' }}
                justifyContent="stretch"
                spacing="md"
                w="full"
              >
                <PoolMyLiquidity />
                <PoolUserEvents
                  isLoading={isLoadingUserPoolEvents}
                  userPoolEvents={userPoolEvents}
                />
              </Stack>
            )}
            <PoolActivity />
            <PoolComposition />
            <PoolBanners />
            <PoolInfoLayout />
          </VStack>
        </ClaimProvider>
      </DefaultPageContainer>

      {banners?.footerSrc && <CowFooter />}
    </>
  )
}

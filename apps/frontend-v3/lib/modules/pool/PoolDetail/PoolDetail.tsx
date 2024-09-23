'use client'

import { VStack, Stack } from '@chakra-ui/react'
import { PoolComposition } from './PoolComposition/PoolComposition'
import { PoolInfoLayout } from './PoolInfo/PoolInfoLayout'
import { usePool } from '../PoolProvider'
import PoolMyLiquidity from './PoolMyLiquidity'
import { PoolStatsLayout } from './PoolStats/PoolStatsLayout'
import { PoolHeader } from './PoolHeader/PoolHeader'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import { PoolAlerts } from '../alerts/PoolAlerts'
import { ClaimProvider } from '../actions/claim/ClaimProvider'
import { usePoolVariant } from '../pool.hooks'
import { useUserAccount } from '../../web3/UserAccountProvider'
import PoolUserEvents from './PoolUserEvents'
import { hasTotalBalance } from '../user-balance.helpers'
import { usePoolEvents } from '../usePoolEvents'
import { DefaultPageContainer } from '@/lib/shared/components/containers/DefaultPageContainer'
import { CowFooter } from '@/app/(app)/pools/cow/CowFooter'
import { CowPoolBanner } from '@/app/(app)/pools/cow/CowPoolBanner'
import { PoolActivity } from './PoolActivity/PoolActivity'

export function PoolDetail() {
  const { pool, chain } = usePool()
  const router = useRouter()
  const pathname = usePathname()
  const { banners } = usePoolVariant()
  const { userAddress, isConnected } = useUserAccount()
  const {
    data: userPoolEventsData,
    loading: isLoadingUserPoolEvents,
    startPolling,
    stopPolling,
  } = usePoolEvents(
    {
      chainIn: [chain],
      poolIdIn: [pool.id],
      userAddress,
    },
    {
      skip: !isConnected,
    }
  )

  useEffect(() => {
    startPolling(120000)
    return () => stopPolling()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const userPoolEvents = userPoolEventsData?.poolEvents

  const userhasPoolEvents = useMemo(() => {
    if (userPoolEvents) {
      return userPoolEvents?.length > 0
    }
  }, [userPoolEvents])

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
          <VStack w="full" spacing="2xl">
            <VStack w="full" spacing="md">
              <PoolAlerts />
              <PoolHeader />
              {banners?.headerSrc && <CowPoolBanner />}

              <PoolStatsLayout />
            </VStack>
            {isConnected && (userHasLiquidity || userhasPoolEvents) && (
              <Stack
                w="full"
                spacing="md"
                direction={{ base: 'column', xl: 'row' }}
                justifyContent="stretch"
              >
                <PoolMyLiquidity />
                <PoolUserEvents
                  userPoolEvents={userPoolEvents}
                  isLoading={isLoadingUserPoolEvents}
                />
              </Stack>
            )}
            <PoolActivity />
            <PoolComposition />
            <PoolInfoLayout />
          </VStack>
        </ClaimProvider>
      </DefaultPageContainer>

      {banners?.footerSrc && <CowFooter />}
    </>
  )
}

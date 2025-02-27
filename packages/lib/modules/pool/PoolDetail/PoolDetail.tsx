'use client'

import { VStack, Stack } from '@chakra-ui/react'
import { PoolComposition } from './PoolComposition'
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
import PoolUserEvents from './PoolUserEvents/PoolUserEvents'
import { hasTotalBalance } from '../user-balance.helpers'
import { usePoolEvents } from '../usePoolEvents'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { CowFooter } from '@repo/lib/shared/components/navs/CowFooter'
import { CowPoolBanner } from '@repo/lib/shared/components/navs/CowPoolBanner'
import { PoolActivity } from './PoolActivity/PoolActivity'
import { PoolHookBanner } from './PoolHookBanner'
import { useGetECLPLiquidityProfile } from '../../eclp/useGetECLPLiquidityProfile'

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

  const { data, poolSpotPrice } = useGetECLPLiquidityProfile(pool)

  console.log({ data, poolSpotPrice })

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
            {isConnected && (userHasLiquidity || userhasPoolEvents) && (
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
            <PoolHookBanner />
            <PoolInfoLayout />
          </VStack>
        </ClaimProvider>
      </DefaultPageContainer>

      {banners?.footerSrc && <CowFooter />}
    </>
  )
}

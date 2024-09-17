import { Stack, Button, VStack } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import PoolMetaBadges from './PoolMetaBadges'

import { usePool } from '../../PoolProvider'
import { shouldBlockAddLiquidity } from '../../pool.helpers'
import { AnalyticsEvent, trackEvent } from '@/lib/shared/services/fathom/Fathom'
import { PoolCategories } from '../../categories/PoolCategories'
import { PoolBreadcrumbs } from './PoolBreadcrumbs'

export function PoolHeader() {
  const pathname = usePathname()
  const { pool } = usePool()
  const router = useRouter()

  const isAddLiquidityBlocked = shouldBlockAddLiquidity(pool)

  function handleClick() {
    trackEvent(AnalyticsEvent.ClickAddLiquidity)
    router.push(`${pathname}/add-liquidity`)
  }

  return (
    <VStack align="start" w="full">
      <PoolBreadcrumbs />
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        spacing="md"
        w="full"
      >
        <PoolMetaBadges />
        <Stack direction={{ base: 'column', md: 'row' }} spacing="md">
          <PoolCategories />
          <Button
            isDisabled={isAddLiquidityBlocked}
            onClick={handleClick}
            size="lg"
            variant="primary"
          >
            Add liquidity
          </Button>
        </Stack>
      </Stack>
    </VStack>
  )
}

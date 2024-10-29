import { Stack, Button, VStack, useDisclosure, HStack } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import PoolMetaBadges from './PoolMetaBadges'

import { usePool } from '../../PoolProvider'
import { isFx, shouldBlockAddLiquidity } from '../../pool.helpers'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'
import { PoolCategories } from '../../categories/PoolCategories'
import { PoolBreadcrumbs } from './PoolBreadcrumbs'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { useState } from 'react'
import { getXavePoolLink } from '../../pool.utils'
import { PoolAdvancedOptions } from './PoolAdvancedOptions'

export function PoolHeader() {
  const pathname = usePathname()
  const { pool } = usePool()
  const router = useRouter()
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Xave)
  const [redirectPartnerUrl, setRedirectPartnerUrl] = useState<string>()
  const partnerRedirectDisclosure = useDisclosure()

  const isAddLiquidityBlocked = shouldBlockAddLiquidity(pool)

  function openRedirectModal(partner: RedirectPartner) {
    setRedirectPartner(partner)
    let url
    if (partner === RedirectPartner.Xave && pool?.address && pool.chain) {
      url = getXavePoolLink(pool.chain, pool.address)
    }
    setRedirectPartnerUrl(url)
    partnerRedirectDisclosure.onOpen()
  }

  function handleClick() {
    trackEvent(AnalyticsEvent.ClickAddLiquidity)
    if (isFx(pool.type)) {
      openRedirectModal(RedirectPartner.Xave)
    } else {
      router.push(`${pathname}/add-liquidity`)
    }
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
          <HStack spacing="sm">
            <Button
              isDisabled={isAddLiquidityBlocked}
              onClick={handleClick}
              size="lg"
              variant="primary"
              w="full"
            >
              Add liquidity
            </Button>

            <PoolAdvancedOptions />
          </HStack>
          <PartnerRedirectModal
            isOpen={partnerRedirectDisclosure.isOpen}
            onClose={partnerRedirectDisclosure.onClose}
            partner={redirectPartner}
            redirectUrl={redirectPartnerUrl}
          />
        </Stack>
      </Stack>
    </VStack>
  )
}

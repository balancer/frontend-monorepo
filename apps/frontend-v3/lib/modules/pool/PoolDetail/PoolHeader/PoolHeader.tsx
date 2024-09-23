import { Stack, Button, VStack, useDisclosure } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import PoolMetaBadges from './PoolMetaBadges'

import { usePool } from '../../PoolProvider'
import { isFx, shouldBlockAddLiquidity } from '../../pool.helpers'
import { AnalyticsEvent, trackEvent } from '@/lib/shared/services/fathom/Fathom'
import { PoolCategories } from '../../categories/PoolCategories'
import { PoolBreadcrumbs } from './PoolBreadcrumbs'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@/lib/shared/components/modals/PartnerRedirectModal'
import { useState } from 'react'
import { getXavePoolLink } from '../../pool.utils'

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
        w="full"
        justify="space-between"
        spacing="md"
        direction={{ base: 'column', md: 'row' }}
      >
        <PoolMetaBadges />
        <Stack spacing="md" direction={{ base: 'column', md: 'row' }}>
          <PoolCategories />
          <Button
            onClick={handleClick}
            variant="primary"
            size="lg"
            isDisabled={isAddLiquidityBlocked}
          >
            Add liquidity
          </Button>
          <PartnerRedirectModal
            partner={redirectPartner}
            redirectUrl={redirectPartnerUrl}
            isOpen={partnerRedirectDisclosure.isOpen}
            onClose={partnerRedirectDisclosure.onClose}
          />
        </Stack>
      </Stack>
    </VStack>
  )
}

import { Stack, Button, VStack, useDisclosure, HStack, Tooltip } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import PoolMetaBadges from './PoolMetaBadges'

import { usePool } from '../../PoolProvider'
import {
  getPoolAddBlockedReason,
  isMaBeetsPool,
  isCowAmmPool,
  isFx,
  shouldBlockAddLiquidity,
} from '../../pool.helpers'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'
import { PoolTags } from '../../tags/PoolTags'
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
  const isCowPool = isCowAmmPool(pool.type)

  const shouldBlockCustom = isMaBeetsPool(pool.id)
  const customReason = shouldBlockCustom
    ? 'Please manage your liquidity on the maBEETS page.'
    : undefined

  const isAddLiquidityBlocked = shouldBlockAddLiquidity(pool, shouldBlockCustom)

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
    <VStack align="start" spacing="md" w="full">
      <PoolBreadcrumbs />
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        spacing="md"
        w="full"
      >
        <PoolMetaBadges />
        <Stack direction={{ base: 'column', md: 'row' }} spacing="md">
          <PoolTags />
          <HStack spacing="sm">
            {/* TODO: Add block reason alerts*/}
            <Tooltip
              label={isAddLiquidityBlocked ? getPoolAddBlockedReason(pool, customReason) : ''}
            >
              <Button
                isDisabled={isAddLiquidityBlocked}
                onClick={handleClick}
                size="lg"
                variant="primary"
                w="full"
              >
                Add liquidity
              </Button>
            </Tooltip>
            {!isCowPool && <PoolAdvancedOptions />}
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

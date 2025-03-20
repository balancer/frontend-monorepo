import { Stack, Button, VStack, useDisclosure, HStack, Tooltip, Text } from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import PoolMetaBadges from './PoolMetaBadges'
import { usePool } from '../../PoolProvider'
import { getPoolAddBlockedReason, isFx, shouldBlockAddLiquidity } from '../../pool.helpers'
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
import { usePoolMetadata } from '../../metadata/usePoolMetadata'
import { formatTextListAsItems } from '@repo/lib/shared/utils/text-format'

export function PoolHeader() {
  const pathname = usePathname()
  const { pool } = usePool()
  const router = useRouter()
  const [redirectPartner, setRedirectPartner] = useState<RedirectPartner>(RedirectPartner.Xave)
  const [redirectPartnerUrl, setRedirectPartnerUrl] = useState<string>()
  const partnerRedirectDisclosure = useDisclosure()
  const poolMetadata = usePoolMetadata(pool)

  const isAddLiquidityBlocked = shouldBlockAddLiquidity(pool, poolMetadata)
  const blockingReasons = formatTextListAsItems(getPoolAddBlockedReason(pool))

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

  const addLiquidityButton = (
    <Button
      isDisabled={isAddLiquidityBlocked}
      onClick={handleClick}
      size="lg"
      variant="primary"
      w="full"
    >
      Add liquidity
    </Button>
  )

  return (
    <VStack align="start" spacing="md" w="full">
      <PoolBreadcrumbs />
      <Stack
        align={{ base: 'start', lg: 'end' }}
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        mt="xs"
        spacing="md"
        w="full"
      >
        <VStack align="start" spacing="md">
          <PoolMetaBadges />
          {poolMetadata?.description && (
            <Text fontSize="sm" maxW="xl" mb="xxs" sx={{ textWrap: 'pretty' }} variant="secondary">
              {poolMetadata.description}
            </Text>
          )}
        </VStack>
        <Stack direction={{ base: 'column', md: 'row' }} spacing="md">
          <PoolTags />
          <HStack spacing="sm">
            {blockingReasons ? (
              <Tooltip
                label={
                  <Text color="primaryTextColor" whiteSpace="pre-line">
                    {blockingReasons}
                  </Text>
                }
              >
                {addLiquidityButton}
              </Tooltip>
            ) : (
              addLiquidityButton
            )}
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

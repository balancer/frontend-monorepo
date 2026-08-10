'use client'

import { useEffect } from 'react'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { BalancerLogoType } from '@bal/lib/components/imgs/BalancerLogoType'
import { PoolName } from '@repo/lib/modules/pool/PoolName'
import { Pool } from '@repo/lib/modules/pool/pool.types'
import PoolMetaBadges from '@repo/lib/modules/pool/PoolDetail/PoolHeader/PoolMetaBadges'

const OG_WIDTH = 1200
const OG_HEIGHT = 630

export function PoolOgCard({ pool }: { pool: Pool }) {
  // Expose rendering readiness to the Chromium screenshot helper: wait until
  // fonts are loaded and every token image has resolved (success or onError
  // swap to the dicebear identicon) before declaring the card ready.
  useEffect(() => {
    let cancelled = false

    async function markReady() {
      await document.fonts?.ready
      if (cancelled) return

      const imagesReady = () =>
        Array.from(document.querySelectorAll('#og-image img')).every(
          img => img instanceof HTMLImageElement && img.complete
        )

      // Poll until images resolve, then give React one more frame to re-render
      // any onError fallback swaps before screenshotting.
      await new Promise<void>(resolve => {
        const check = () => {
          if (imagesReady()) {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => resolve())
            })
          } else {
            setTimeout(check, 50)
          }
        }
        check()
      })

      if (cancelled) return
      document.getElementById('og-image')?.setAttribute('data-ready', 'true')
    }

    markReady()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Box
      alignItems="center"
      backgroundColor="background.base"
      // Chakra v2 passes backgroundImage as-is (no token resolution), so use the
      // gradient value from the theme's backgroundImage.card.gradient token
      backgroundImage="radial-gradient(farthest-corner at 80px 0px, rgba(180, 189, 200, 0.3) 0%, rgba(255, 255, 255, 0.0) 100%)"
      border="1px solid"
      borderColor="border.base"
      display="flex"
      flexDirection="column"
      height={`${OG_HEIGHT}px`}
      justifyContent="space-between"
      overflow="hidden"
      padding="64px"
      position="relative"
      width={`${OG_WIDTH}px`}
    >
      <HStack justifyContent="space-between" width="full">
        <BalancerLogoType color="#E5D3BE" height="32px" />
        <Text color="font.secondary" fontSize="xl">
          balancer.fi
        </Text>
      </HStack>

      <VStack flex="1" justifyContent="center" spacing="lg">
        {/* PoolName hardcodes fontSize="sm" internally; scale it up for OG sizing */}
        <Box transform="scale(2.4)" transformOrigin="center">
          <PoolName pool={pool} />
        </Box>
        <PoolMetaBadges pool={pool} />
      </VStack>
    </Box>
  )
}

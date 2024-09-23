'use client'

import { ReactLenis } from '@studio-freight/react-lenis'
import { Box } from '@chakra-ui/react'
import { AnimatedSVG } from '@/lib/shared/components/marketing/AnimatedSVG'
import { HomeHero } from '@/lib/shared/components/marketing/HomeHero'
import { HomeBuilders } from '@/lib/shared/components/marketing/HomeBuilders'
import { HomeProtocols } from '@/lib/shared/components/marketing/HomeProtocols'
import { HomeActivity } from '@/lib/shared/components/marketing/HomeActivity'

export default function Home() {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5 }}>
      <Box className="homepage" overflowX="hidden">
        <HomeHero />
        <Box height={{ base: '100px', md: '200px' }} zIndex="-1" position="relative">
          <AnimatedSVG />
        </Box>
        <HomeBuilders />
        <HomeProtocols />
        <HomeActivity />
      </Box>
    </ReactLenis>
  )
}

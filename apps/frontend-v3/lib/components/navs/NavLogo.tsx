'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { BalancerLogo } from '../imgs/BalancerLogo'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { Box, Link } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NextLink from 'next/link'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

export function NavLogo() {
  const handleLogoClick = () => {
    trackEvent(AnalyticsEvent.ClickNavBalancerLogo)
  }

  return (
    <Box as={motion.div} variants={fadeIn}>
      <Link as={NextLink} href="/" onClick={handleLogoClick} prefetch variant="nav">
        <Box>
          <Box display={{ base: 'block', md: 'none' }}>
            <BalancerLogo width="26px" />
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <BalancerLogoType width="106px" />
          </Box>
        </Box>
      </Link>
    </Box>
  )
}

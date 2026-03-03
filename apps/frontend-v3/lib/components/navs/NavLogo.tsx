'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { BalancerLogo } from '../imgs/BalancerLogo'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { Box, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion'
import NextLink from 'next/link'
import { AnalyticsEvent, trackEvent } from '@repo/lib/shared/services/fathom/Fathom'

export function NavLogo() {
  const handleLogoClick = () => {
    trackEvent(AnalyticsEvent.ClickNavBalancerLogo)
  }

  return (
    <Box variants={fadeIn} asChild><motion.div>
        <Link variant="nav" asChild><NextLink href="/" onClick={handleLogoClick} prefetch>
            <Box>
              <Box display={{ base: 'block', md: 'none' }}>
                <BalancerLogo width="26px" />
              </Box>
              <Box display={{ base: 'none', md: 'block' }}>
                <BalancerLogoType width="106px" />
              </Box>
            </Box>
          </NextLink></Link>
      </motion.div></Box>
  );
}

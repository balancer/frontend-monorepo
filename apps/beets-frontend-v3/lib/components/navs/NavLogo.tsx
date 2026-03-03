'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { Box, Link } from '@chakra-ui/react';
import { motion } from 'framer-motion'
import NextLink from 'next/link'
import { BeetsLogo } from '../imgs/BeetsLogo'
import { BeetsLogoType } from '../imgs/BeetsLogoType'
export function NavLogo() {
  return (
    <Box variants={fadeIn} asChild><motion.div>
        <Link variant="nav" asChild><NextLink href="/" prefetch>
            <Box>
              <Box display={{ base: 'block', md: 'none' }}>
                <BeetsLogo width="26px" />
              </Box>
              <Box display={{ base: 'none', md: 'block' }}>
                <BeetsLogoType width="106px" />
              </Box>
            </Box>
          </NextLink></Link>
      </motion.div></Box>
  );
}

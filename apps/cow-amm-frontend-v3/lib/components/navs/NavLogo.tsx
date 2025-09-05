'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { CowAmmLogo } from '../imgs/CowAmmLogo'
import { CowAmmLogoType } from '../imgs/CowAmmLogoType'
import { Box, Link } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NextLink from 'next/link'

export function NavLogo() {
  return (
    <Box as={motion.div} variants={fadeIn}>
      <Link as={NextLink} href="/" prefetch variant="nav">
        <Box>
          <Box display={{ base: 'block', md: 'none' }}>
            <CowAmmLogo height="21px" />
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <CowAmmLogoType width="106px" />
          </Box>
        </Box>
      </Link>
    </Box>
  )
}

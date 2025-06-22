'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { BalancerLogo } from '../imgs/BalancerLogo'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { Box, Link } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NextLink from 'next/link'

export function NavLogo() {
  return (
    <Box as={motion.div} variants={fadeIn}>
      <Link as={NextLink} href="/" prefetch variant="nav">
        <Box>
          {/* <Box display={{ base: 'block', md: 'none' }}>
            <BalancerLogo width="26px" />
          </Box>
          <Box display={{ base: 'none', md: 'block' }}>
            <BalancerLogoType width="106px" />
          </Box> */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src="./Aggtrade-logo.svg" alt="" />
            <p style={{ fontWeight: 600, fontSize: '20px', color: 'white' }}>AggTrade</p>
          </div>
        </Box>
      </Link>
    </Box>
  )
}

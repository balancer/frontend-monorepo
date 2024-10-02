'use client'

import { fadeIn } from '@repo/lib/shared/utils/animations'
import { Box, Link } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import NextLink from 'next/link'

export function NavLogo() {
  return (
    <Box as={motion.div} variants={fadeIn}>
      <Link as={NextLink} variant="nav" href="/" prefetch={true}>
        <Box>
          <Box display={{ base: 'block', md: 'none' }}>B</Box>
          <Box display={{ base: 'none', md: 'block' }}>BEETS</Box>
        </Box>
      </Link>
    </Box>
  )
}

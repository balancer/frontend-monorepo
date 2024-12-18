'use client'

import { Box, useColorModeValue } from '@chakra-ui/react'

export function BeetsPromoBanner() {
  return (
    <Box
      boxShadow="lg"
      height="140px"
      maxW="100%"
      overflow="hidden"
      position="relative"
      rounded="lg"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      width="full"
    >
      <Box
        width="100%"
        height="100%"
        backgroundImage="/images/misc/pools-banner.png"
        backgroundSize="cover"
        backgroundPosition="center"
      />
    </Box>
  )
}

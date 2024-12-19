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
        backgroundImage="/images/misc/pools-banner.png"
        backgroundPosition="center"
        backgroundSize="cover"
        height="100%"
        width="100%"
      />
    </Box>
  )
}

'use client'

import { Heading, Flex, Box, Center } from '@chakra-ui/react'

export function BeetsPromoBanner() {
  return (
    <Box
      background={`url('/images/misc/banner1.png') no-repeat center center`}
      backgroundSize="cover"
      boxShadow="lg"
      h={{ base: '200px', sm: '140px' }}
      height="140px"
      maxW="100%"
      overflow="hidden"
      position="relative"
      rounded="lg"
      sx={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      w="full"
    >
      <Center className="copy" h="100%" w="full" zIndex="1">
        <Flex
          alignItems="center"
          borderRadius="xl"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 'md', lg: 'md' }}
          justifyContent="center"
          mx="2xl"
          w="full"
          zIndex="1"
        >
          <Heading
            color="#fff"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="regular"
            lineHeight="1"
          >
            BEETS 2.0:
          </Heading>
          <Heading
            color="font.light"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            fontWeight="regular"
            lineHeight="1"
            pl="sm"
          >
            The Sonic Revolution
          </Heading>
          <Heading display={{ base: 'none', md: 'block' }} ml="auto" variant="special">
            Simpler. Sleeker. Smarter.
          </Heading>
        </Flex>
      </Center>
    </Box>
  )
}

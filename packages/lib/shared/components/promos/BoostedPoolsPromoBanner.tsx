'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'

export function BoostedPoolsPromoBanner() {
  return (
    <Box
      background={`url('/images/promos/boosted-pools/bg.png') no-repeat center center`}
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
      width="full"
    >
      <Center className="copy" h="100%" zIndex="1">
        <Flex
          alignItems="center"
          borderRadius="xl"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 'md', lg: 'md' }}
          justifyContent="center"
          zIndex="1"
        >
          <Flex
            alignItems="center"
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 'sm', sm: '0' }}
          >
            <Box>
              <Heading
                color="#fff"
                fontSize={{ base: 'xl', md: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                100% Boosted Pools:
              </Heading>
            </Box>
            <Box pl="sm" textAlign="center">
              <Heading
                color="font.light"
                fontSize={{ base: 'xl', md: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                Boosted earnings, simplified strategy
              </Heading>
            </Box>
          </Flex>
          <Button
            _hover={{ bg: '#fff', color: '#000' }}
            as={NextLink}
            bg="font.light"
            color="font.dark"
            cursor="hand"
            flex="1"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            href="/pools?poolTags=BOOSTED"
            py="sm"
            rounded="full"
            shadow="2xl"
            size="md"
            w="max-content"
          >
            View pools
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}

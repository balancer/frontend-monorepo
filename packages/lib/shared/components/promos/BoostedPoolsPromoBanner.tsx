'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'

export function BoostedPoolsPromoBanner() {
  const { colorMode } = useColorMode()

  return (
    <Box
      backgroundImage={
        colorMode === 'dark'
          ? 'url(/images/promos/boosted-pools/bg-dark.jpg)'
          : 'url(/images/promos/boosted-pools/bg.jpg)'
      }
      backgroundSize="cover"
      h={{ base: '200px', sm: '140px' }}
      height="140px"
      maxW="100%"
      overflow="hidden"
      position="relative"
      rounded="lg"
      shadow="2xl"
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
                color={colorMode === 'dark' ? '#fff' : '#000'}
                fontSize={{ base: 'xl', md: '3xl', lg: '4xl' }}
                fontWeight="regular"
                lineHeight="1"
              >
                100% Boosted Pools:
              </Heading>
            </Box>
            <Box pl="sm" textAlign="center">
              <Heading
                color={colorMode === 'dark' ? 'font.light' : '#555'}
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

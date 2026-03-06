'use client'
import React from 'react'
import { useThemeColorMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { Button, Heading, Flex, Box, Center } from '@chakra-ui/react'
import NextLink from 'next/link'

export function BoostedPoolsPromoBanner() {
  const colorMode = useThemeColorMode()

  return (
    <Box
      backgroundImage={
        colorMode === 'dark'
          ? 'url(/images/promos/boosted-pools/bg-dark.jpg)'
          : 'url(/images/promos/boosted-pools/bg.jpg)'
      }
      backgroundSize="cover"
      css={{
        width: '100% !important',
        maxWidth: '100% !important',
      }}
      h={{ base: '200px', sm: '140px' }}
      height="140px"
      maxW="100%"
      overflow="hidden"
      position="relative"
      rounded="lg"
      shadow="2xl"
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
            asChild
            bg="font.light"
            color="font.dark"
            cursor="hand"
            flex="1"
            h={{ base: '32px', sm: '40px', lg: '48px' }}
            py="sm"
            rounded="full"
            shadow="2xl"
            size="md"
            w="max-content"
          >
            <NextLink href="/pools?poolTags=BOOSTED">View pools</NextLink>
          </Button>
        </Flex>
      </Center>
    </Box>
  )
}

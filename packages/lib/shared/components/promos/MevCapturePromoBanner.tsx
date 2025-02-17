'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center, Text, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'

export function MevCapturePromoBanner() {
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
          alignItems="space-between"
          borderRadius="xl"
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 'md', lg: 'md' }}
          justifyContent="space-between"
          p={{ base: 'md', md: 'lg' }}
          w="full"
          zIndex="1"
        >
          <Box>
            <Box>
              <Heading
                color={colorMode === 'dark' ? '#fff' : '#000'}
                fontSize={{ base: '20px', md: '22px', lg: '24px' }}
                fontWeight="bold"
                letterSpacing="-0.7px"
                lineHeight="1"
                pb="ms"
              >
                Join a pool that captures MEV for you
              </Heading>
            </Box>
            <Box>
              <Text
                color={colorMode === 'dark' ? 'font.maxContrast' : '#555'}
                fontSize={{ base: 'md' }}
                fontWeight="medium"
                lineHeight="1"
                maxW="600px"
                opacity="0.8"
              >
                Introducing the MEV Capture Hook—a new revenue stream for LPs on Base.
              </Text>
            </Box>
          </Box>
          <Flex gap="ms">
            <Button
              _hover={{ bg: '#fff', color: '#000' }}
              as={NextLink}
              borderColor="font.maxContrast"
              color="font.maxContrast"
              cursor="hand"
              flex="1"
              h={{ base: '32px', sm: '40px', lg: '48px' }}
              href="/pools?poolTags=BOOSTED"
              py="sm"
              rounded="full"
              shadow="2xl"
              size="md"
              variant="outline"
              w="120px"
            >
              Learn more
            </Button>
            <Button
              _hover={{ bg: '#fff', color: '#000' }}
              as={NextLink}
              bg="font.maxContrast"
              color="font.dark"
              cursor="hand"
              flex="1"
              h={{ base: '32px', sm: '40px', lg: '48px' }}
              href="/pools?poolTags=BOOSTED"
              py="sm"
              rounded="full"
              shadow="2xl"
              size="md"
              w="120px"
            >
              View pools
            </Button>
          </Flex>
        </Flex>
      </Center>
    </Box>
  )
}

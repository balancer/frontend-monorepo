'use client'

import React from 'react'
import {
  Button,
  Badge,
  Heading,
  Flex,
  Box,
  Center,
  Text,
  useColorMode,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'

export function StableSurgePromoBanner() {
  const { colorMode } = useColorMode()

  return (
    <Box
      backgroundImage={
        colorMode === 'dark'
          ? 'url(/images/promos/stablesurge/stablesurge.jpg)'
          : 'url(/images/promos/stablesurge/stablesurge.jpg)'
      }
      backgroundSize="cover"
      height={{ base: '100%', md: '100%' }}
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
            <Stack direction={{ base: 'column', md: 'row' }} gap="md">
              <Badge
                alignItems="center"
                background="background.level0"
                backgroundImage="url(/images/promos/stablesurge/icon.png)"
                border="1px solid"
                borderColor="border.base"
                color="font.light"
                display="flex"
                fontSize="xs"
                fontWeight="normal"
                h={14}
                rounded="full"
                shadow="sm"
                w={14}
              >
                <Center h="full" w="full">
                  <HookIcon size={45} />
                </Center>
              </Badge>

              <Box>
                <Box>
                  <Heading
                    color={colorMode === 'dark' ? '#fff' : '#fff'}
                    fontSize={{ base: '20px', md: '22px', lg: '24px' }}
                    fontWeight="bold"
                    letterSpacing="-0.7px"
                    lineHeight="1"
                    pb="sm"
                  >
                    StableSurge Hook
                  </Heading>
                </Box>
                <Box>
                  <Text
                    color={colorMode === 'dark' ? '#fff' : '#fff'}
                    fontSize={{ base: 'md' }}
                    fontWeight="medium"
                    lineHeight="1.25"
                    maxW="600px"
                    opacity="0.8"
                  >
                    Applies a dynamic directional surge swap fee in times of volatility to help
                    defend the peg. LPs get MEV protection and increased fees.
                  </Text>
                </Box>
              </Box>
            </Stack>
          </Box>
          <Flex gap="ms">
            <Button
              _hover={{ bg: '#fff', color: '#000' }}
              as={NextLink}
              bg="#fff"
              color="black"
              cursor="hand"
              flex="1"
              h={{ base: '32px', sm: '40px', lg: '48px' }}
              href="https://medium.com/balancer-protocol/balancers-stablesurge-hook-09d2eb20f219"
              maxW="120px"
              py="sm"
              rounded="full"
              shadow="2xl"
              size="md"
              variant="outline"
              w="120px"
            >
              Learn more
            </Button>
          </Flex>
        </Flex>
      </Center>
    </Box>
  )
}

'use client'

import React from 'react'
import { Button, Heading, Flex, Box, Center, Text, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { Picture } from '../other/Picture'

export function MevCapturePromoBanner() {
  const { colorMode } = useColorMode()

  return (
    <Box rounded="lg" shadow="2xl">
      <Box
        height={{ base: '100%', md: '132px' }}
        maxW="100%"
        overflow="hidden"
        position="relative"
        rounded="lg"
        shadow={
          colorMode === 'dark'
            ? '-2px -2px 4px 0px rgba(0, 0, 0, 0.65) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.65) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.08) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.20) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.08) inset'
            : '-2px -2px 4px 0px rgba(0, 0, 0, 0.08) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.08) inset, 1px 1px 2px 0px rgba(255, 255, 255, 1) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.80) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.80) inset'
        }
        sx={{
          width: '100% !important',
          maxWidth: '100% !important',
        }}
        width="full"
      >
        <Box height="100%" position="absolute" width="100%" zIndex="-1">
          <Picture
            altText="MEV Capture Promo Background"
            defaultImgType="jpg"
            directory="/images/promos/mev-capture/"
            height="100%"
            imgAvifDark
            imgJpg
            imgJpgDark
            imgName="bg"
            width="100%"
          />
        </Box>

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
                  fontSize={{ base: '18px', md: '22px', lg: '24px' }}
                  fontWeight="bold"
                  letterSpacing="-0.7px"
                  lineHeight="1.2"
                  pb="ms"
                  sx={{
                    textWrap: 'pretty',
                  }}
                >
                  New pools that capture MEV for you
                </Heading>
              </Box>
              <Box>
                <Text
                  color={colorMode === 'dark' ? 'font.maxContrast' : '#222'}
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontWeight="medium"
                  lineHeight="1.2"
                  maxW="600px"
                  opacity="0.95"
                  sx={{
                    textWrap: 'balance',
                  }}
                >
                  Introducing the MEV Capture Hook—a new revenue stream for LPs on Base.
                </Text>
              </Box>
            </Box>
            <Flex alignItems="center" gap="ms" maxW="284px">
              <Button
                _hover={{
                  bg: 'gradient.sandDark',
                  color: '#000',
                  borderColor: colorMode === 'dark' ? 'font.light' : 'font.light',
                }}
                as={NextLink}
                borderColor="font.maxContrast"
                color="font.maxContrast"
                cursor="hand"
                flex="1"
                gap="xs"
                h={{ base: '32px', sm: '40px', lg: '48px' }}
                href="https://medium.com/balancer-protocol/mev-internalization-through-priority-fee-taxes-coming-to-balancer-v3-on-base-q1-2025-f20b3e1b7295"
                py="sm"
                role="group"
                rounded="full"
                size="md"
                target="_blank"
                variant="outline"
                w="132px"
              >
                Learn more
                <Box
                  _groupHover={{
                    transform: 'translateX(2px)',
                  }}
                  as="span"
                  transition="transform 0.2s"
                >
                  <ArrowUpRight size="14px" />
                </Box>
              </Button>
              <Button
                _hover={{
                  bg: colorMode === 'dark' ? 'gradient.dawnDark' : 'gradient.dawnDark',
                  color: colorMode === 'dark' ? '#000' : '#000',
                }}
                as={NextLink}
                bg="font.maxContrast"
                color={colorMode === 'dark' ? 'font.dark' : '#fff'}
                cursor="hand"
                flex="1"
                h={{ base: '32px', sm: '40px', lg: '48px' }}
                href="/pools?poolTags=MevCapture"
                py="sm"
                rounded="full"
                size="md"
                w="132px"
              >
                View pools
              </Button>
            </Flex>
          </Flex>
        </Center>
      </Box>
    </Box>
  )
}

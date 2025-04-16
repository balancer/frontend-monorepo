'use client'

import { Button, Heading, Flex, Box, Center, Text, Stack, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Picture } from '../other/Picture'
import { ArrowUpRight } from 'react-feather'

export function QuantAMMPromoBanner() {
  const { colorMode } = useColorMode()
  return (
    <Box rounded="lg" shadow="2xl" w="full">
      <Box
        height={{ base: '100%', md: '132px' }}
        maxW="100%"
        overflow="hidden"
        position="relative"
        rounded="lg"
        shadow="innerRockShadowSm"
        sx={{
          width: '100% !important',
          maxWidth: '100% !important',
        }}
        width="full"
      >
        <Box height="100%" position="absolute" width="100%" zIndex="-1">
          <Picture
            altText="Rock texture"
            defaultImgType="jpg"
            directory="/images/promos/quantamm/"
            height="100%"
            imgAvif
            imgAvifDark
            imgAvifPortrait
            imgAvifPortraitDark
            imgJpg
            imgJpgDark
            imgName="bg"
            width="100%"
          />
        </Box>

        <Center className="copy" h="100%" zIndex="1">
          <Flex
            align={{ base: 'start', md: 'center' }}
            borderRadius="xl"
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 'md', lg: 'md' }}
            justifyContent="space-between"
            p={{ base: 'md', md: 'lg' }}
            w="full"
            zIndex="1"
          >
            <Box>
              <Stack
                align={{ base: 'start', md: 'center' }}
                direction={{ base: 'column', md: 'row' }}
                gap="md"
              >
                <Box h="auto" w="80px">
                  <Picture
                    altText="QuantAMM logo"
                    defaultImgType="png"
                    directory="/images/promos/quantamm/"
                    imgName="quantamm-logo"
                  />
                </Box>
                <Box>
                  <Box>
                    <Heading
                      color="font.maxContrast"
                      fontSize={{ base: '20px', md: '22px', lg: '24px' }}
                      fontWeight="bold"
                      letterSpacing="-0.7px"
                      lineHeight="1"
                      pb="sm"
                    >
                      This is a &lsquo;BTF&rsquo; by QuantAMM on Balancer v3
                    </Heading>
                  </Box>
                  <Box>
                    <Text
                      color="font.maxContrast"
                      fontSize={{ base: 'md' }}
                      fontWeight="medium"
                      lineHeight="1.25"
                      maxW="600px"
                      opacity={colorMode === 'dark' ? '0.9' : '1'}
                      sx={{
                        textWrap: 'balance',
                      }}
                    >
                      Blockchain Traded Funds are smart pools that capture profit for LPs by
                      executing strategies that can favorably auto-adapt pool weights during market
                      volatility.
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <Flex alignItems="center" gap="ms" maxW="284px">
              <Button
                _hover={{
                  bg: '#fff',
                  color: colorMode === 'dark' ? '#000' : '#000',
                }}
                as={NextLink}
                bg={colorMode === 'dark' ? 'transparent' : 'transparent'}
                border="1px solid"
                borderColor={colorMode === 'dark' ? '#fff' : '#000'}
                color={colorMode === 'dark' ? '#fff' : '#000'}
                cursor="hand"
                flex="1"
                h={{ base: '32px', sm: '40px', lg: '48px' }}
                href="https://www.quantamm.fi/"
                py="sm"
                rounded="full"
                size="md"
                transition="all 0.3s var(--cubic)"
                w="128px"
              >
                Learn more{' '}
                <Box pl="xxs">
                  <ArrowUpRight size="14px" />
                </Box>
              </Button>
            </Flex>
          </Flex>
        </Center>
      </Box>
    </Box>
  )
}

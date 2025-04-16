'use client'

import { Button, Heading, Flex, Box, Center, Text, Stack, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Picture } from '../other/Picture'
import { ArrowUpRight } from 'react-feather'
import { EzklIcon } from '@repo/lib/shared/components/icons/logos/EzklIcon'

export function EzklPromoBanner() {
  const { colorMode } = useColorMode()
  return (
    <Box rounded="lg" shadow="2xl" w="full">
      <Box
        height={{ base: '100%', md: '132px' }}
        maxW="100%"
        overflow="hidden"
        position="relative"
        rounded="lg"
        shadow="innerRockShadow"
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
            directory="/images/promos/ezkl/"
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
                <Box color={colorMode === 'dark' ? '#FA2424' : '#FA2424'}>
                  <EzklIcon width={140} />
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
                      EZKL dynamic fees
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
                      Fees on this pool are controlled by a ZK strategy that adjusts the pool fee
                      based on volatility. ZK infrastructure provided by EZKL.
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <Flex alignItems="center" gap="ms" maxW="284px">
              <Button
                _hover={{
                  bg: '#f00',
                  color: colorMode === 'dark' ? '#fff' : '#fff',
                }}
                as={NextLink}
                bg={colorMode === 'dark' ? '#fff' : '#fff'}
                border="1px solid"
                borderColor={colorMode === 'dark' ? '#fff' : 'transparent'}
                color={colorMode === 'dark' ? '#000' : '#000'}
                cursor="hand"
                flex="1"
                h={{ base: '32px', sm: '40px', lg: '48px' }}
                href="https://blog.ezkl.xyz/post/defi3dot0/"
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

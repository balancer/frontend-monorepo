'use client'

import { Button, Heading, Flex, Box, Center, Text, Stack, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { Picture } from '../other/Picture'
import { ArrowUpRight } from 'react-feather'

export function StableSurgePromoBanner() {
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
            altText="StableSurge rock texture"
            defaultImgType="jpg"
            directory="/images/promos/stablesurge/"
            height="100%"
            imgAvif
            imgAvifDark
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
                <Box h={14} rounded="full" shadow="2xl" w={14}>
                  <Box h={14} rounded="full" shadow="md" w={14}>
                    <Box
                      alignItems="center"
                      color={colorMode === 'dark' ? 'font.light' : 'brown.300'}
                      display="flex"
                      fontSize="xs"
                      fontWeight="normal"
                      h={14}
                      overflow="hidden"
                      rounded="full"
                      shadow="innerRockShadow"
                      w={14}
                    >
                      <Box
                        h={14}
                        overflow="hidden"
                        position="absolute"
                        rounded="full"
                        w={14}
                        zIndex="-1"
                      >
                        <Picture
                          altText="Rock texture"
                          defaultImgType="jpg"
                          directory="/images/homepage/"
                          height={14}
                          imgAvif
                          imgAvifDark
                          imgJpg
                          imgJpgDark
                          imgName="stone"
                          width={14}
                        />
                      </Box>
                      <Center h="full" w="full">
                        <HookIcon size={45} />
                      </Center>
                    </Box>
                  </Box>
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
                      StableSurge Hook
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
                      Applies a dynamic directional surge swap fee in times of volatility to help
                      defend the peg. LPs get MEV protection and increased fees.
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <Button
              _hover={{
                bg: colorMode === 'dark' ? '#000' : '#fff',
                color: colorMode === 'dark' ? '#fff' : '#000',
              }}
              as={NextLink}
              borderColor="font.maxContrast"
              color="font.maxContrast"
              cursor="hand"
              flex="1"
              gap="xs"
              h={{ base: '32px', sm: '40px', lg: '48px' }}
              href="https://medium.com/balancer-protocol/balancers-stablesurge-hook-09d2eb20f219"
              maxW="132px"
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
                transition="all 0.3s var(--ease-out-cubic)"
              >
                <ArrowUpRight size="14px" />
              </Box>
            </Button>
          </Flex>
        </Center>
      </Box>
    </Box>
  )
}

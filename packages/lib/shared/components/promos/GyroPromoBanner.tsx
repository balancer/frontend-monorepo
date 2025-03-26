'use client'

import { Button, Heading, Flex, Box, Center, Text, Stack, useColorMode } from '@chakra-ui/react'
import NextLink from 'next/link'
import { GyroIcon } from '@repo/lib/shared/components/icons/GyroIcon'
import { Picture } from '../other/Picture'

export function GyroPromoBanner() {
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
            defaultImgType="png"
            directory="/images/promos/gyro/"
            height="100%"
            imgAvif
            imgAvifDark
            imgAvifPortrait
            imgAvifPortraitDark
            imgName="bg"
            imgPng
            imgPngDark
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
                      color={colorMode === 'dark' ? 'font.light' : 'font.dark'}
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
                        <GyroIcon size={32} />
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
                      Superliquidty, made simple
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
                      Next-gen Gyroscope pools are now live on Balancer v3
                    </Text>
                  </Box>
                </Box>
              </Stack>
            </Box>
            <Flex alignItems="center" gap="ms" maxW="284px">
              {/* <Button
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
                w="128px"
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
              </Button> */}
              <Button
                _hover={{
                  bg: 'linear-gradient(to right, rgb(240, 255, 155), rgb(255, 180, 255), rgb(145, 245, 245))',
                  color: colorMode === 'dark' ? '#000' : '#000',
                }}
                as={NextLink}
                bg="font.maxContrast"
                border="1px solid"
                borderColor="font.dark"
                color={colorMode === 'dark' ? 'font.dark' : '#fff'}
                cursor="hand"
                flex="1"
                h={{ base: '32px', sm: '40px', lg: '48px' }}
                href="/pools?protocolVersion=3&poolTypes=GYRO"
                py="sm"
                rounded="full"
                size="md"
                transition="all 0.3s var(--cubic)"
                w="128px"
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

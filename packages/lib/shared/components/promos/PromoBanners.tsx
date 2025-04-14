'use client'

import { useState } from 'react'
import { Button, Heading, Flex, Box, Center, Text, useColorMode, Link } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { Picture } from '../other/Picture'
import { PromoHookIcon } from '../icons/promos/PromoHookIcon'
import { PromoGyroIcon } from '../icons/promos/PromoGyroIcon'
import { PromoVThreeIcon } from '../icons/promos/PromoVThreeIcon'
import { PromoBoostedIcon } from '../icons/promos/PromoBoostedIcon'

interface PromoItem {
  id: number
  icon: React.ReactElement
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
  linkText?: string
  linkURL?: string
  linkExternal?: boolean
  bgImageActive?: {
    directory: string
    imgName: string
  }
  bgImageInactive?: {
    directory: string
    imgName: string
  }
}

const promoData: PromoItem[] = [
  {
    id: 0,
    icon: <PromoBoostedIcon size={44} />,
    title: '100% Boosted Pools on Balancer v3',
    description:
      'A simple, capital efficient strategy for LPs to get boosted yield. Partnering with leading lending protocols like Aave and Morpho.',
    buttonText: 'View pools',
    buttonLink: '/pools?poolTags=BOOSTED',
    linkText: 'Learn more',
    linkURL: 'https://docs.balancer.fi/concepts/explore-available-balancer-pools/boosted-pool.html',
    linkExternal: true,
    bgImageActive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-active0',
    },
    bgImageInactive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-inactive0',
    },
  },
  {
    id: 1,
    icon: <PromoVThreeIcon size={44} />,
    title: 'Balancer v3 is live and thriving!',
    description:
      'A simple, flexible, powerful platform to innovate upon and build the future of AMMs. Battle-tested on-chain since November.',
    buttonText: 'View pools',
    buttonLink: 'pools?protocolVersion=3',
    linkText: 'Learn more',
    linkURL: 'https://docs.balancer.fi/partner-onboarding/balancer-v3/v3-overview.html',
    linkExternal: true,
    bgImageActive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-active1',
    },
    bgImageInactive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-inactive1',
    },
  },
  {
    id: 2,
    icon: <PromoGyroIcon size={44} />,
    title: 'Superliquidity, made simple',
    description: 'Next generation Gyroscope pools are now live on Balancer v3.',
    buttonText: 'View pools',
    buttonLink: '/pools?protocolVersion=3&poolTypes=GYRO',
    linkText: 'Learn more',
    linkURL: 'https://www.gyro.finance/',
    linkExternal: true,
    bgImageActive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-active2',
    },
    bgImageInactive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-inactive2',
    },
  },
  {
    id: 3,
    icon: <PromoHookIcon size={44} />,
    title: 'StableSurge Hook',
    description:
      'A dynamic directional surge swap fee in times of volatility to help defend the peg. LPs get MEV protection and increased fees.',
    buttonText: 'View pools',
    buttonLink: '/pools?poolHookTags=HOOKS_STABLESURGE',
    linkText: 'Learn more',
    linkURL: 'https://medium.com/balancer-protocol/balancers-stablesurge-hook-09d2eb20f219',
    linkExternal: true,
    bgImageActive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-active3',
    },
    bgImageInactive: {
      directory: '/images/promos/promo-banner/',
      imgName: 'bg-inactive3',
    },
  },
]

export function PromoBanners() {
  const { colorMode } = useColorMode()
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 'sm', md: 'md' }}
      h="auto"
      minHeight="132px"
      w="full"
    >
      {promoData.map((item, index) => {
        const isActive = activeIndex === index

        return (
          <Box
            _hover={!isActive ? { bg: colorMode === 'dark' ? 'gray.750' : 'gray.50' } : {}}
            bg={colorMode === 'dark' ? 'black' : 'background.level2'}
            borderRadius="lg"
            cursor={isActive ? 'default' : 'pointer'}
            display="block"
            flexBasis={isActive ? 'auto' : 'clamp(60px, calc(14.0625vw - 48px), 132px)'}
            flexGrow={isActive ? 1 : 0}
            flexShrink={{ base: 0, md: isActive ? 1 : 0 }}
            height="auto"
            key={item.id}
            onClick={() => !isActive && setActiveIndex(index)}
            overflow="hidden"
            p={0}
            position="relative"
            role="group"
            shadow="2xl"
            textAlign="left"
            transition="flex-basis 0.2s var(--ease-out-cubic), flex-grow 0.2s var(--ease-out-cubic), box-shadow 0.1s var(--ease-out-cubic)"
            width={{ base: 'full', md: 'auto' }}
          >
            {item.bgImageActive && (
              <Box
                _after={{
                  bg: 'black',
                  bottom: 0,
                  content: '""',
                  left: 0,
                  opacity: 0,
                  pointerEvents: 'none',
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  transition: 'opacity 0.2s var(--ease-out-cubic)',
                  zIndex: 1,
                }}
                height="100%"
                opacity={isActive ? 1 : 0}
                position="absolute"
                transition="opacity 0.5s var(--ease-out-cubic) 0.05s"
                width="100%"
                zIndex="0"
              >
                {isActive && (
                  <>
                    <Picture
                      altText="Background texture"
                      defaultImgType="png"
                      directory={item.bgImageActive.directory}
                      height="100%"
                      imgAvif
                      imgAvifDark
                      imgAvifPortrait
                      imgAvifPortraitDark
                      imgName={item.bgImageActive.imgName}
                      imgPng
                      imgPngDark
                      width="100%"
                    />
                    <Box
                      bg={colorMode === 'dark' ? '#000' : 'background.level3'}
                      h="full"
                      left="0"
                      opacity={0}
                      position="absolute"
                      top="0"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                      w="full"
                      zIndex="0"
                    />
                  </>
                )}
              </Box>
            )}

            <Center h="100%" position="relative" zIndex="1">
              <Box
                h="100%"
                opacity={isActive ? 1 : 0}
                pointerEvents={isActive ? 'auto' : 'none'}
                shadow={isActive ? 'innerRockShadow' : '0'}
                transform={isActive ? 'translateX(0)' : 'translateX(12px)'}
                transition="opacity 1s var(--ease-out-cubic), transform 0.2s var(--ease-out-cubic)"
                w="full"
              >
                {isActive && (
                  <Flex
                    align={{ base: 'start', md: 'center' }}
                    direction={{ base: 'column', md: 'row' }}
                    gap={{ base: 'ms', md: 'md', lg: 'lg' }}
                    h="full"
                    justifyContent="space-between"
                    p={{ base: 'md', md: 'lg' }}
                    w="full"
                  >
                    <Flex
                      align="center"
                      alignItems={{ base: 'start', md: 'center' }}
                      direction={{ base: 'column', md: 'row' }}
                      gap="md"
                    >
                      <Box flexShrink={0} h={14} w={14}>
                        <Center h="full" w="full">
                          <Box color={colorMode === 'dark' ? 'font.maxContrast' : 'brown.500'}>
                            {item.icon}
                          </Box>
                        </Center>
                      </Box>

                      <Box>
                        <Heading
                          as="h3"
                          color="font.maxContrast"
                          fontSize={{ base: 'lg', md: 'lg', xl: '2xl' }}
                          fontWeight="bold"
                          letterSpacing="-0.5px"
                          lineHeight="1.1"
                          pb="xs"
                          sx={{
                            textWrap: 'balance',
                          }}
                        >
                          {item.title}
                        </Heading>
                        <Text
                          color="font.maxContrast"
                          fontSize={{ base: 'xs', lg: 'md' }}
                          fontWeight="medium"
                          lineHeight="1.25"
                          maxW="46ch"
                          opacity={colorMode === 'dark' ? '0.75' : '1'}
                          sx={{
                            textWrap: 'balance',
                          }}
                        >
                          {item.description}{' '}
                          <Link
                            alignItems="center"
                            color="font.maxContrast"
                            display="inline-flex"
                            fontSize={{ base: 'sm', lg: 'md' }}
                            gap="xxs"
                            href={item.linkURL}
                            pb="2px"
                            target={item.linkExternal ? '_blank' : '_self'}
                            textDecoration="underline"
                            textDecorationColor="font.secondary"
                            textDecorationStyle="dotted"
                          >
                            {item.linkText} {item.linkExternal && <ArrowUpRight size={12} />}
                          </Link>
                        </Text>
                      </Box>
                    </Flex>

                    {item.buttonText && item.buttonLink && (
                      <Flex alignItems="center" flexShrink={0} justifySelf="flex-end">
                        <Button
                          _hover={
                            index === 2
                              ? {
                                  bg: 'linear-gradient(to right, rgb(240, 255, 155), rgb(255, 180, 255), rgb(145, 245, 245))',
                                  color: colorMode === 'dark' ? '#000' : '#000',
                                }
                              : { bg: 'white', color: 'font.dark', opacity: 0.9 }
                          }
                          animation="fadeIn 0.3s var(--ease-out-cubic) 0.3s both"
                          as={NextLink}
                          bg="transparent"
                          border="1px solid"
                          borderColor="font.maxContrast"
                          color="font.maxContrast"
                          cursor="pointer"
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          h={{ base: '32px', sm: '36px' }}
                          href={item.buttonLink}
                          onClick={e => e.stopPropagation()}
                          px="ms"
                          rounded="full"
                          size="md"
                          whiteSpace="nowrap"
                        >
                          {item.buttonText}
                        </Button>
                      </Flex>
                    )}
                  </Flex>
                )}
              </Box>
            </Center>

            {!isActive && (
              <Box h="full" left="0" overflow="hidden" position="absolute" top="0" w="full">
                {item.bgImageInactive && (
                  <>
                    <Picture
                      altText="Background texture"
                      defaultImgType="png"
                      directory={item.bgImageInactive.directory}
                      height="100%"
                      imgAvif
                      imgAvifDark
                      imgAvifPortrait
                      imgAvifPortraitDark
                      imgName={item.bgImageInactive.imgName}
                      imgPng
                      imgPngDark
                      width="100%"
                    />
                    <Box
                      _groupHover={{ opacity: 0.4 }}
                      bg={colorMode === 'dark' ? '#000' : 'background.level2'}
                      h="full"
                      left="0"
                      opacity={0}
                      position="absolute"
                      top="0"
                      transition="opacity 0.2s var(--ease-out-cubic)"
                      w="full"
                      zIndex="0"
                    />
                  </>
                )}
                <Center>
                  <Flex
                    _groupHover={{ shadow: '0' }}
                    align={{ base: 'start', md: 'center' }}
                    direction="column"
                    gap="sm"
                    h="full"
                    justifyContent="center"
                    left={0}
                    p="md"
                    position="absolute"
                    shadow="innerRockShadowSm"
                    top={0}
                    transition="box-shadow 0.15s var(--ease-out-cubic) 1s"
                    w="full"
                  >
                    <Box
                      _groupHover={{
                        color: colorMode === 'dark' ? 'font.maxContrast' : 'brown.500',
                        opacity: 1,
                      }}
                      color={colorMode === 'dark' ? 'font.secondary' : 'brown.400'}
                      opacity="0.8"
                      transition="color 0.3s var(--ease-out-cubic), opacity 0.3s var(--ease-out-cubic), box-shadow 0.15s var(--ease-out-cubic)"
                    >
                      {item.icon}
                    </Box>
                  </Flex>
                </Center>
              </Box>
            )}
          </Box>
        )
      })}
    </Flex>
  )
}

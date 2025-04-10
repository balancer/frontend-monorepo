'use client'

import { useState } from 'react'
import { Button, Heading, Flex, Box, Center, Text, useColorMode, Link } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { GyroIcon } from '@repo/lib/shared/components/icons/GyroIcon'
import { Picture } from '../other/Picture'
import { BoostedPoolIcon } from '../icons/BoostedPoolIcon'
import { VThreeIcon } from '../icons/VThreeIcon'
import { HookIcon } from '../icons/HookIcon'

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
  bgImage?: {
    directory: string
    imgName: string
  }
}

const promoData: PromoItem[] = [
  {
    id: 0,

    icon: <BoostedPoolIcon size={40} />,
    title: '100% Boosted Pools on Balancer v3',
    description:
      'A simple, capital efficient strategy to get boosted yield from partners like Aave and Morpho',
    buttonText: 'View pools',
    buttonLink: '/pools?poolTags=BOOSTED',
    bgImage: {
      directory: '/images/promos/gyro/',
      imgName: 'bg',
    },
  },
  {
    id: 1,
    icon: <VThreeIcon size={48} />,
    title: 'Balancer v3 is live!',
    description: 'A perfect balances simplicity and flexibility to reshape the future of AMMs.',
    buttonText: 'View pools',
    buttonLink: 'pools?protocolVersion=3',

    bgImage: {
      directory: '/images/promos/gyro/',
      imgName: 'bg',
    },
  },
  {
    id: 2,
    icon: <GyroIcon size={32} />,
    title: 'Superliquidity, made simple',
    description: 'Next-gen Gyroscope pools are now live on Balancer v3.',
    buttonText: 'View pools',
    buttonLink: '/pools?protocolVersion=3&poolTypes=GYRO',
    linkText: 'Learn more',
    linkURL: 'https://www.gyroscope.com/',
    linkExternal: true,
    bgImage: {
      directory: '/images/promos/gyro/',
      imgName: 'bg',
    },
  },
  {
    id: 3,
    icon: <HookIcon size={48} />,
    title: 'StableSurge Hook',
    description:
      'Applies a dynamic directional surge swap fee in times of volatility to help defend the peg. LPs get MEV protection and increased fees.',
    buttonText: 'View pools',
    buttonLink: '/pools?poolHookTags=HOOKS_STABLESURGE',
    bgImage: {
      directory: '/images/promos/gyro/',
      imgName: 'bg',
    },
  },
]

export function PromoBanners() {
  const { colorMode } = useColorMode()
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      gap={{ base: 'xs', md: 'md' }}
      h="auto"
      minHeight="132px"
      w="full"
    >
      {promoData.map((item, index, arr) => {
        const isActive = activeIndex === index
        const isFirst = index === 0
        const isLast = index === arr.length - 1

        const borderRadiusProps = {
          borderTopLeftRadius: isFirst ? '2xl' : 'md',
          borderBottomLeftRadius: isFirst ? '2xl' : 'md',
          borderTopRightRadius: isLast ? '2xl' : 'md',
          borderBottomRightRadius: isLast ? '2xl' : 'md',
        }

        return (
          <Box
            _hover={!isActive ? { bg: colorMode === 'dark' ? 'gray.750' : 'gray.50' } : {}}
            bg={colorMode === 'dark' ? 'black' : 'white'}
            cursor={isActive ? 'default' : 'pointer'}
            display="block"
            flexBasis={isActive ? 'auto' : { base: 'auto', md: '132px' }}
            flexGrow={isActive ? 1 : 0}
            flexShrink={{ base: 0, md: isActive ? 1 : 0 }}
            height={{ base: isActive ? '132px' : 'auto', md: 'auto' }}
            key={item.id}
            onClick={() => !isActive && setActiveIndex(index)}
            overflow="hidden"
            p={0}
            position="relative"
            textAlign="left"
            transition="flex-basis 0.15s var(--ease-out-cubic), flex-grow 0.15s var(--ease-out-cubic)"
            width={{ base: 'full', md: 'auto' }}
            {...borderRadiusProps}
            shadow="2xl"
          >
            {item.bgImage && (
              <Box
                height="100%"
                opacity={isActive ? 1 : 0}
                position="absolute"
                transition="opacity 0.5s var(--ease-out-cubic) 0.05s"
                width="100%"
                zIndex="0"
              >
                {isActive && (
                  <Picture
                    altText="Background texture"
                    defaultImgType="png"
                    directory={item.bgImage.directory}
                    height="100%"
                    imgAvif
                    imgAvifDark
                    imgAvifPortrait
                    imgAvifPortraitDark
                    imgName={item.bgImage.imgName}
                    imgPng
                    imgPngDark
                    width="100%"
                  />
                )}
              </Box>
            )}

            <Center h="100%" position="relative" zIndex="1">
              <Box
                h="100%"
                opacity={isActive ? 1 : 0}
                pointerEvents={isActive ? 'auto' : 'none'}
                transform={isActive ? 'translateX(0)' : 'translateX(12px)'}
                transition="opacity 1s var(--ease-out-cubic), transform 0.5s var(--ease-out-cubic)"
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
                    <Flex align="center" gap="md">
                      <Box flexShrink={0} h={14} w={14}>
                        <Center h="full" w="full">
                          {item.icon}
                        </Center>
                      </Box>

                      <Box>
                        <Heading
                          as="h3"
                          color="font.maxContrast"
                          fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
                          fontWeight="bold"
                          letterSpacing="-0.5px"
                          lineHeight="1.1"
                          pb="xs"
                        >
                          {item.title}
                        </Heading>
                        <Text
                          color="font.maxContrast"
                          fontSize={{ base: 'sm', lg: 'md' }}
                          fontWeight="medium"
                          lineHeight="1.25"
                          maxW="600px"
                          opacity={colorMode === 'dark' ? '0.85' : '1'}
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
                            target={item.linkExternal ? '_blank' : '_self'}
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
                            index === 0
                              ? {
                                  bg: 'linear-gradient(to right, rgb(240, 255, 155), rgb(255, 180, 255), rgb(145, 245, 245))',
                                  color: colorMode === 'dark' ? '#000' : '#000',
                                }
                              : { opacity: 0.9 }
                          }
                          animation="fadeIn 0.3s var(--ease-out-cubic) 0.3s both"
                          as={NextLink}
                          bg="transparent"
                          border="1px solid"
                          borderColor="font.maxContrast"
                          color="font.maxContrast"
                          cursor="pointer"
                          fontSize="sm"
                          h={{ base: '32px', sm: '36px', lg: '40px' }}
                          href={item.buttonLink}
                          onClick={e => e.stopPropagation()}
                          px="md"
                          py="sm"
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
                {item.bgImage && (
                  <Picture
                    altText="Background texture"
                    defaultImgType="png"
                    directory={item.bgImage.directory}
                    height="100%"
                    imgAvif
                    imgAvifDark
                    imgAvifPortrait
                    imgAvifPortraitDark
                    imgName={item.bgImage.imgName}
                    imgPng
                    imgPngDark
                    width="100%"
                  />
                )}
                <Center>
                  <Flex
                    align={{ base: 'start', md: 'center' }}
                    color={colorMode === 'dark' ? 'gray.400' : 'gray.600'}
                    direction="column"
                    gap="sm"
                    h="full"
                    justifyContent="center"
                    left={0}
                    p="md"
                    position="absolute"
                    top={0}
                    w="full"
                  >
                    <Box color="inherit">{item.icon}</Box>
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

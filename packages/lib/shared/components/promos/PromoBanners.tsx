'use client'

import { useState, useRef } from 'react'
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Link,
  Text,
  useColorMode,
  useBreakpointValue,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import NextLink from 'next/link'
import { Picture } from '../other/Picture'
import { PromoHookIcon } from '../icons/promos/PromoHookIcon'
import { PromoGyroIcon } from '../icons/promos/PromoGyroIcon'
import { PromoVThreeIcon } from '../icons/promos/PromoVThreeIcon'
import { PromoBoostedIcon } from '../icons/promos/PromoBoostedIcon'
import { PromoItem } from '@repo/lib/config/config.types'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { getRandomInt } from '@repo/lib/shared/utils/numbers'

function getIconElement(icon: string) {
  switch (icon) {
    case 'boosted':
      return <PromoBoostedIcon size={44} />
    case 'v3':
      return <PromoVThreeIcon size={44} />
    case 'gyro':
      return <PromoGyroIcon size={44} />
    case 'hook':
      return <PromoHookIcon size={44} />
    default:
      return null
  }
}

const promoData: (PromoItem & { iconElement: React.ReactNode })[] =
  PROJECT_CONFIG.promoItems?.map(item => ({
    ...item,
    iconElement: getIconElement(item.icon),
  })) ?? []

export function PromoBanners() {
  const { colorMode } = useColorMode()
  const [activeIndex, setActiveIndex] = useState(getRandomInt(0, promoData.length - 1))
  const isSmallScreen = useBreakpointValue({ base: true, md: false }, { fallback: 'md' }) ?? false
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToItem = (index: number) => {
    if (isSmallScreen && scrollContainerRef.current) {
      const itemWidth = window.innerWidth * 0.8 // 80vw
      const gapWidth = 8 // 'sm' gap in pixels
      const scrollPosition = index * (itemWidth + gapWidth)

      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }

  const handleItemClick = (index: number) => {
    setActiveIndex(index)
    scrollToItem(index)
  }

  return (
    <Box
      css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
      mx={{ base: '-md', md: 0 }}
      overflowX={{ base: 'scroll', md: 'visible' }}
      pb={{ base: 'xl', md: 0 }}
      px={{ base: 'md', md: 0 }}
      ref={scrollContainerRef}
      scrollSnapType={{ base: 'x mandatory', md: 'none' }}
    >
      <Flex
        direction={{ base: 'row', md: 'row' }}
        gap={{ base: 'sm', md: 'ms' }}
        h="auto"
        minHeight="132px"
        width={{ base: 'max-content', md: 'full' }}
      >
        {promoData.map((item, index) => {
          const isActive = activeIndex === index
          const shouldShowAsActive = isActive || isSmallScreen

          return (
            <Box
              _hover={!isActive ? { bg: colorMode === 'dark' ? 'gray.750' : 'gray.50' } : {}}
              bg={colorMode === 'dark' ? 'black' : 'background.level2'}
              borderRadius="lg"
              cursor={isActive ? 'default' : 'pointer'}
              display="block"
              flexBasis={{
                base: '80vw',
                md: isActive ? 'auto' : 'clamp(60px, calc(14.0625vw - 48px), 132px)',
              }}
              flexGrow={{ base: 0, md: isActive ? 1 : 0 }}
              flexShrink={{ base: 0, md: isActive ? 1 : 0 }}
              height="auto"
              key={item.id}
              onClick={() => handleItemClick(index)}
              overflowX="hidden"
              p={0}
              position="relative"
              role="group"
              scrollSnapAlign="start"
              shadow="2xl"
              textAlign="left"
              transition="flex-basis 0.2s var(--ease-out-cubic), flex-grow 0.2s var(--ease-out-cubic), box-shadow 0.1s var(--ease-out-cubic)"
              width={{ base: '80vw', md: 'auto' }}
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
                  opacity={shouldShowAsActive ? 1 : 0}
                  position="absolute"
                  transition="opacity 0.5s var(--ease-out-cubic) 0.05s"
                  width="100%"
                  zIndex="0"
                >
                  {shouldShowAsActive && (
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
                  opacity={shouldShowAsActive ? 1 : 0}
                  pointerEvents={shouldShowAsActive ? 'auto' : 'none'}
                  shadow={isActive ? 'innerRockShadow' : '0'}
                  transform={shouldShowAsActive ? 'translateX(0)' : 'translateX(12px)'}
                  transition="opacity 1s var(--ease-out-cubic), transform 0.2s var(--ease-out-cubic)"
                  w="full"
                >
                  {shouldShowAsActive && (
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
                            <Box
                              color={colorMode === 'dark' ? 'font.maxContrast' : 'brown.500'}
                              left={{ base: '-10px', md: '0' }}
                              position="relative"
                            >
                              {item.iconElement}
                            </Box>
                          </Center>
                        </Box>
                        <Box>
                          <Heading
                            as="h3"
                            color="font.maxContrast"
                            fontSize={{ base: 'md', md: 'lg', xl: '2xl' }}
                            fontWeight="bold"
                            letterSpacing="-0.5px"
                            lineHeight="1.1"
                            pb="sm"
                            sx={{
                              textWrap: 'balance',
                            }}
                          >
                            {item.title}
                          </Heading>
                          <Text
                            color="font.maxContrast"
                            fontSize={{ base: 'xs', sm: 'sm', lg: 'md' }}
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
                              fontSize={{ base: 'xs', sm: 'sm', lg: 'md' }}
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
                            animation="fade-in 0.3s var(--ease-out-cubic) 0.3s both"
                            as={NextLink}
                            bg="transparent"
                            border="1px solid"
                            borderColor="font.maxContrast"
                            color="font.maxContrast"
                            cursor="pointer"
                            fontSize={{ base: 'xs', sm: 'sm' }}
                            h={{ base: '32px', sm: '36px' }}
                            href={item.buttonLink}
                            mb="sm"
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
              {!shouldShowAsActive && !isSmallScreen && (
                <Box
                  h="full"
                  left="0"
                  opacity={{ base: 1, md: 1 }}
                  overflow="hidden"
                  pointerEvents="none"
                  position="absolute"
                  top="0"
                  w="full"
                >
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
                      opacity={{ base: 1, md: 1 }}
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
                        {item.iconElement}
                      </Box>
                    </Flex>
                  </Center>
                </Box>
              )}
            </Box>
          )
        })}
      </Flex>
    </Box>
  )
}

'use client'

import {
  Box,
  Heading,
  Text,
  Link,
  Stack,
  VStack,
  Image as ChakraImage,
  useColorMode,
} from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'
import { Picture } from './Picture'
// import { ArrowRightIcon } from '@chakra-ui/icons'

interface PartnerCardProps {
  title: string
  description: string
  icon?: string
  iconName?: string
  backgroundImage?: string
  ctaText?: string
  ctaUrl?: string
  bgColor?: string
  externalLink?: boolean
}

export function PartnerCard({
  title,
  description,
  icon,
  iconName,
  ctaText,
  ctaUrl,
  bgColor = 'gray.900',
  externalLink = false,
}: PartnerCardProps) {
  const iconSrc = iconName ? `/images/logos/circular-bg/${iconName}.svg` : icon
  const { colorMode } = useColorMode()

  return (
    <Box height="100%">
      <Link
        _hover={{ transform: 'scale(1)', transition: 'transform 0.2s var(--ease-out-cubic)' }}
        href={ctaUrl}
        role="group"
      >
        <Box
          _groupHover={{ shadow: 'none' }}
          borderRadius="xl"
          height="100%"
          shadow="2xl"
          transition="transform 0.5s var(--ease-out-cubic)"
        >
          <Box
            _groupHover={{
              shadow:
                colorMode === 'dark'
                  ? '-2px -2px 4px 0px rgba(0, 0, 0, 0.25) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.25) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.04) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.1) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.04) inset'
                  : '-2px -2px 4px 0px rgba(0, 0, 0, 0.1) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.1) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.15) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.15) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.15) inset',
            }}
            backgroundPosition="center"
            backgroundSize="cover"
            borderRadius="xl"
            height="full"
            overflow="hidden"
            position="relative"
            shadow={
              colorMode === 'dark'
                ? '-2px -2px 4px 0px rgba(0, 0, 0, 0.5) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.5) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.08) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.15) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.08) inset'
                : '-2px -2px 4px 0px rgba(0, 0, 0, 0.2) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.2) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.3) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.3) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.3) inset'
            }
            transition="all 0.3s var(--ease-out-cubic)"
            width="full"
          >
            <Box height="100%" position="absolute" width="100%">
              <Box
                _groupHover={{
                  transform: 'scale(1.01)',
                }}
                bgColor={bgColor}
                height="100%"
                position="absolute"
                transform="scale(1.02)"
                transition="transform 0.5s var(--ease-out-cubic)"
                width="100%"
                zIndex="-1"
              >
                <Picture
                  altText="MEV Capture Promo Background"
                  defaultImgType="png"
                  directory="/images/partners/cards/"
                  height="102%"
                  imgAvif
                  imgName={iconName || ''}
                  imgPng
                  width="102%"
                />
              </Box>
            </Box>
            <VStack
              align="flex-start"
              height="full"
              p={{ base: 'lg', sm: 'md', md: 'lg' }}
              position="relative"
              spacing={4}
              zIndex={1}
            >
              <VStack align="flex-start" spacing={2}>
                <Stack
                  align="start"
                  alignItems={{ base: 'center', sm: 'start' }}
                  direction={{ base: 'row', sm: 'column' }}
                  gap="5"
                >
                  {iconSrc && (
                    <Box
                      _groupHover={{ transform: 'scale(1.1)' }}
                      height="48px"
                      rounded="full"
                      shadow="2xl"
                      transition="all 0.3s var(--ease-out-cubic)"
                      width="48px"
                    >
                      <ChakraImage alt={`${title} icon`} objectFit="contain" src={iconSrc} />
                    </Box>
                  )}
                  <Heading color="white" mb="1" size="lg">
                    {title}
                  </Heading>
                </Stack>
                <Text
                  _groupHover={{ opacity: '1' }}
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                  lineHeight="relaxed"
                  opacity="0.75"
                  sx={{ textWrap: 'balance' }}
                  transition="transform 0.3s var(--ease-out-cubic)"
                >
                  {description}
                </Text>
              </VStack>
              {ctaText && ctaUrl && (
                <Box
                  _hover={{ opacity: 0.8 }}
                  alignItems="center"
                  color="white"
                  display="inline-flex"
                  mb="2"
                  mt="auto"
                >
                  <Text
                    _groupHover={{ textDecoration: 'underline' }}
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    transition="all 2s var(--ease-out-cubic)"
                  >
                    {ctaText}
                    {externalLink && (
                      <Box as="span" display="inline-block" ml="0.5">
                        <ArrowUpRight size={12} />
                      </Box>
                    )}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </Box>
      </Link>
    </Box>
  )
}

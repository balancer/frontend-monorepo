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
  backgroundImage,
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
        <Box borderRadius="xl" height="100%" shadow="2xl">
          <Box
            _before={{
              content: `''`,
              position: 'absolute',
              top: 0,
              left: 0,
              width: 'full',
              height: 'full',
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
              zIndex: 0,
              shadow:
                colorMode === 'dark'
                  ? '-2px -2px 4px 0px rgba(0, 0, 0, 0.5) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.5) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.08) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.15) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.08) inset'
                  : '-2px -2px 4px 0px rgba(0, 0, 0, 0.2) inset, -4px -4px 8px 0px rgba(0, 0, 0, 0.2) inset, 1px 1px 2px 0px rgba(255, 255, 255, 0.3) inset, 4px 4px 8px 0px rgba(255, 255, 255, 0.30) inset, 2px 2px 4px 0px rgba(255, 255, 255, 0.3) inset',

              _groupHover: {
                transform: 'scale(1.1)',
              },
              transition: 'transform 1s var(--ease-out-cubic)',
            }}
            backgroundPosition="center"
            backgroundSize="cover"
            bgColor={bgColor}
            borderRadius="xl"
            height="full"
            overflow="hidden"
            p={6}
            position="relative"
          >
            <VStack align="flex-start" height="full" position="relative" spacing={4} zIndex={1}>
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
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                  lineHeight="relaxed"
                  sx={{ textWrap: 'balance' }}
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
                  </Text>
                  {externalLink && (
                    <Box ml="0.5">
                      <ArrowUpRight size={12} />
                    </Box>
                  )}
                </Box>
              )}
            </VStack>
          </Box>
        </Box>
      </Link>
    </Box>
  )
}

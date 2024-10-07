'use client'

import NextLink from 'next/link'
import { Stack, Divider, Text, Box, VStack, HStack, Link, IconButton } from '@chakra-ui/react'
import { staggeredFadeIn } from '@repo/lib/shared/utils/animations'
import { motion } from 'framer-motion'
import { DefaultPageContainer } from '../containers/DefaultPageContainer'
import { ArrowUpRight } from 'react-feather'
import { AppLink } from '../navs/useNav'
import { LinkSection } from './footer.types'
import { ReactNode } from 'react'

type CardContentProps = {
  linkSections: LinkSection[]
  logoType: ReactNode
  title: string
  subTitle: string
}

function CardContent({ linkSections, logoType, title, subTitle }: CardContentProps) {
  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      justify="space-between"
      py={{ base: 'sm', lg: 'md' }}
      spacing={{ base: 'xl', lg: 'md' }}
      w="full"
    >
      <VStack color="font.primary" align="start" spacing="lg" width={{ base: 'auto', md: '70%' }}>
        {logoType}
        <VStack align="start" spacing="sm">
          <Text variant="secondary" fontSize="4xl" fontWeight="500" letterSpacing="-0.4px">
            {title}
          </Text>
          <Text variant="secondary" sx={{ textWrap: 'balance' }}>
            {subTitle}
          </Text>
        </VStack>
      </VStack>
      <Stack
        direction={{ base: 'column', lg: 'row' }}
        w="full"
        justify="space-between"
        align="start"
        spacing={{ base: 'lg', lg: 'md' }}
      >
        {linkSections.map(section => (
          <VStack key={section.title} align="start" spacing={{ base: 'sm', lg: 'ms' }}>
            <Text variant="eyebrow" fontSize={{ base: 'xs', md: 'xs' }} color="font.secondary">
              {section.title}
            </Text>
            <VStack align="start" spacing={{ base: 'xs', lg: 'sm' }}>
              {section.links.map(link => (
                <Link
                  as={NextLink}
                  variant="nav"
                  key={link.href}
                  href={link.href}
                  flexBasis="row"
                  flex="auto"
                >
                  <HStack gap="xxs">
                    <Box
                      fontWeight="medium"
                      letterSpacing="-0.25px"
                      fontSize={{ base: 'sm', md: 'md' }}
                    >
                      {link.label}
                    </Box>
                    {link.isExternal && (
                      <Box color="grayText">
                        <ArrowUpRight size={12} />
                      </Box>
                    )}
                  </HStack>
                </Link>
              ))}
            </VStack>
          </VStack>
        ))}
      </Stack>
    </Stack>
  )
}

function SocialLinks({ socialLinks }: { socialLinks: AppLink[] }) {
  return (
    <HStack spacing="ms" w={{ base: 'full', lg: 'auto' }}>
      {socialLinks.map(({ href, icon }) => (
        <IconButton
          as={Link}
          key={href}
          href={href}
          aria-label="Social icon"
          variant="tertiary"
          isRound
          rounded="full"
          isExternal
          w="44px"
          h="44px"
          bg="background.level2"
        >
          {icon}
        </IconButton>
      ))}
    </HStack>
  )
}

function LegalLinks({ legalLinks }: { legalLinks: AppLink[] }) {
  return (
    <HStack
      w="full"
      justify={{ base: 'start', lg: 'end' }}
      spacing={{ base: 'sm', lg: 'md' }}
      wrap="wrap"
      p={{ base: 'sm', lg: '0' }}
    >
      {legalLinks.map(link => (
        <Link
          color="font.secondary"
          fontSize={{ base: 'xs', md: 'sm' }}
          key={link.href}
          href={link.href}
          as={NextLink}
        >
          {link.label}
        </Link>
      ))}
    </HStack>
  )
}

type FooterProps = {
  linkSections: LinkSection[]
  socialLinks: AppLink[]
  legalLinks: AppLink[]
  logoType: ReactNode
  title: string
  subTitle: string
}

export function Footer({
  linkSections,
  socialLinks,
  legalLinks,
  logoType,
  title,
  subTitle,
}: FooterProps) {
  return (
    <Box as="footer" background="background.level0" shadow="innerLg">
      <DefaultPageContainer py="xl">
        <VStack align="start" spacing="lg" pt="md">
          <CardContent
            linkSections={linkSections}
            logoType={logoType}
            title={title}
            subTitle={subTitle}
          />
          <Divider />
          <Stack
            align="start"
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            alignItems={{ base: 'none', lg: 'center' }}
            gap="md"
            as={motion.div}
            variants={staggeredFadeIn}
            initial="hidden"
            animate="show"
            w="full"
          >
            <SocialLinks socialLinks={socialLinks} />
            <LegalLinks legalLinks={legalLinks} />
          </Stack>
        </VStack>
      </DefaultPageContainer>
    </Box>
  )
}

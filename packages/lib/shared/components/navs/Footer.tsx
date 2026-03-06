'use client'

import NextLink from 'next/link'
import { Stack, Text, Box, VStack, HStack, Link, IconButton, Separator } from '@chakra-ui/react'
import { staggeredFadeIn } from '@repo/lib/shared/utils/animations'
import { motion } from 'framer-motion'
import { DefaultPageContainer } from '../containers/DefaultPageContainer'
import { ArrowUpRight } from 'react-feather'
import { AppLink } from '../navs/useNav'
import { LinkSection } from './footer.types'
import { ReactNode } from 'react'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { SocialIcon } from './SocialIcon'
import { useAppzi } from '@repo/lib/shared/hooks/useAppzi'

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
      gap={{ base: 'xl', lg: 'md' }}
      justify="space-between"
      py={{ base: 'sm', lg: 'md' }}
      w="full"
    >
      <VStack align="start" color="font.primary" gap="lg" width={{ base: 'auto', md: '70%' }}>
        <Box w="120px">{logoType}</Box>
        <VStack align="start" gap="sm">
          <Text fontSize="4xl" fontWeight="500" letterSpacing="-0.4px" variant="secondary">
            {title}
          </Text>
          <Text
            css={{
              textWrap: 'balance',
            }}
            variant="secondary"
          >
            {subTitle}
          </Text>
        </VStack>
      </VStack>
      <Stack
        align="start"
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 'lg', lg: 'md' }}
        justify="space-between"
        w="full"
      >
        {linkSections.map(section => (
          <VStack align="start" gap={{ base: 'sm', lg: 'ms' }} key={section.title}>
            <Text color="font.secondary" fontSize={{ base: 'xs', md: 'xs' }} variant="eyebrow">
              {section.title}
            </Text>
            <VStack align="start" gap={{ base: 'xs', lg: 'sm' }}>
              {section.links.map(link => (
                <Link
                  flex="auto"
                  flexBasis="row"
                  href={link.href}
                  key={link.href}
                  variant="nav"
                  {...(link.isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  <HStack gap="xxs">
                    <Box
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight="medium"
                      letterSpacing="-0.25px"
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
    <HStack gap="ms" w={{ base: 'full', lg: 'auto' }}>
      {socialLinks.map(({ href, iconType }) => (
        <IconButton
          aria-label="Social icon"
          asChild
          bg="background.level2"
          h="44px"
          key={href}
          rounded="full"
          variant="tertiary"
          w="44px"
        >
          <Link href={href} rel="noopener noreferrer" target="_blank">
            <SocialIcon iconType={iconType} />
          </Link>
        </IconButton>
      ))}
    </HStack>
  )
}

function LegalLinks({ legalLinks }: { legalLinks: AppLink[] }) {
  const { openNpsModal } = useAppzi()

  return (
    <HStack
      gap={{ base: 'sm', lg: 'md' }}
      justify={{ base: 'start', lg: 'end' }}
      p={{ base: 'sm', lg: '0' }}
      w="full"
      wrap="wrap"
    >
      {legalLinks.map(link => {
        const key = link.href || link.label
        const isFeedback = link.label === 'Feedback'

        if (isFeedback) {
          return (
            <Link
              color="font.secondary"
              cursor="pointer"
              fontSize={{ base: 'xs', md: 'sm' }}
              key={key}
              onClick={openNpsModal}
            >
              {link.label}
            </Link>
          )
        }

        return (
          <Link asChild color="font.secondary" fontSize={{ base: 'xs', md: 'sm' }} key={key}>
            <NextLink href={link.href || '#'}>{link.label}</NextLink>
          </Link>
        )
      })}
    </HStack>
  )
}

type FooterProps = {
  logoType: ReactNode
  title: string
  subTitle: string
}

export function Footer({ logoType, title, subTitle }: FooterProps) {
  const {
    footer: { linkSections },
    links: { socialLinks, legalLinks },
  } = PROJECT_CONFIG

  return (
    <Box as="footer" background="background.level0" shadow="innerLg">
      <DefaultPageContainer py="xl">
        <VStack align="start" gap="lg" pt="md">
          <CardContent
            linkSections={linkSections}
            logoType={logoType}
            subTitle={subTitle}
            title={title}
          />
          <Separator />
          <motion.div animate="show" initial="hidden" variants={staggeredFadeIn}>
            <Stack
              align="start"
              alignItems={{ base: 'none', lg: 'center' }}
              direction={{ base: 'column', lg: 'row' }}
              gap="md"
              justify="space-between"
              w="full"
            >
              <SocialLinks socialLinks={socialLinks} />
              <LegalLinks legalLinks={legalLinks} />
            </Stack>
          </motion.div>
        </VStack>
      </DefaultPageContainer>
    </Box>
  )
}

'use client'

import NextLink from 'next/link'
import { Stack, Divider, Text, Box, VStack, HStack, Link, IconButton } from '@chakra-ui/react'
import { staggeredFadeIn } from '@/lib/shared/utils/animations'
import { motion } from 'framer-motion'
import { DefaultPageContainer } from '../containers/DefaultPageContainer'
import { BalancerLogoType } from '../imgs/BalancerLogoType'
import { ArrowUpRight } from 'react-feather'
import { useNav } from './useNav'

type LinkSection = {
  title: string
  links: { href: string; label: string; isExternal?: boolean }[]
}

function CardContent() {
  const linkSections: LinkSection[] = [
    {
      title: 'Build on Balancer',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Balancer v3', href: '/build/v3' },

        { label: 'v3 Docs', href: 'https://docs-v3.balancer.fi', isExternal: true },
        {
          label: 'Prototype on v3',
          href: 'https://github.com/balancer/scaffold-balancer-v3',
          isExternal: true,
        },
        { label: 'Grants', href: 'https://grants.balancer.community', isExternal: true },
        { label: 'v2 Docs', href: 'https://docs.balancer.fi', isExternal: true },
      ],
    },
    {
      title: 'Use Balancer protocol',
      links: [
        { label: 'Explore pools', href: '/pools' },
        { label: 'Swap tokens', href: '/swap' },
        { label: 'View portfolio', href: '/portfolio' },
        { label: 'Get veBAL', href: 'https://app.balancer.fi/#/vebal', isExternal: true },
        {
          label: 'Create an LBP',
          href: 'https://www.fjordfoundry.com/?utm_source=balancer&utm_medium=website',
          isExternal: true,
        },
        {
          label: 'Create an NFT drop',
          href: 'https://fjordnfts.com/?utm_source=balancer&utm_medium=website',
          isExternal: true,
        },
      ],
    },
    {
      title: 'Ecosystem',
      links: [
        { label: 'Forum', href: 'https://forum.balancer.fi', isExternal: true },
        { label: 'Governance', href: 'https://vote.balancer.fi', isExternal: true },
        {
          label: 'Bug bounties',
          href: 'https://immunefi.com/bug-bounty/balancer',
          isExternal: true,
        },
        { label: 'Dune Analytics', href: 'https://dune.com/balancer', isExternal: true },
        { label: 'Defilytica', href: 'https://balancer.defilytica.com', isExternal: true },
        {
          label: 'Brand assets',
          href: 'https://github.com/balancer/brand-assets',
          isExternal: true,
        },
      ],
    },
  ]

  return (
    <Stack
      direction={{ base: 'column', lg: 'row' }}
      justify="space-between"
      py={{ base: 'sm', lg: 'md' }}
      spacing={{ base: 'xl', lg: 'md' }}
      w="full"
    >
      <VStack color="font.primary" align="start" spacing="lg" width={{ base: 'auto', md: '70%' }}>
        <BalancerLogoType width="120px" />
        <VStack align="start" spacing="sm">
          <Text variant="secondary" fontSize="4xl" fontWeight="500" letterSpacing="-0.4px">
            AMMs made easy
          </Text>
          <Text variant="secondary" sx={{ textWrap: 'balance' }}>
            Balancer is a battle-tested toolkit for true AMM experimentation and innovation.
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

function SocialLinks() {
  const { getSocialLinks } = useNav()

  return (
    <HStack spacing="ms" w={{ base: 'full', lg: 'auto' }}>
      {getSocialLinks(24).map(({ href, icon }) => (
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

function LegalLinks() {
  const legalLinks = [
    { label: 'Terms of use', href: '/terms-of-use' },
    { label: 'Privacy policy', href: '/privacy-policy' },
    { label: 'Cookies policy', href: '/cookies-policy' },
    { label: '3rd party services', href: '/3rd-party-services' },
    { label: 'Risks', href: '/risks' },
  ]

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

export function Footer() {
  return (
    <Box as="footer" background="background.level0" shadow="innerLg">
      <DefaultPageContainer py="xl">
        <VStack align="start" spacing="lg" pt="md">
          <CardContent />
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
            <SocialLinks />
            <LegalLinks />
          </Stack>
        </VStack>
      </DefaultPageContainer>
    </Box>
  )
}

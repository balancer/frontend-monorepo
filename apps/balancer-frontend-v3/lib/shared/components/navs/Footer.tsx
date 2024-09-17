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
      <VStack align="start" color="font.primary" spacing="lg" width={{ base: 'auto', md: '70%' }}>
        <BalancerLogoType width="120px" />
        <VStack align="start" spacing="sm">
          <Text fontSize="4xl" fontWeight="500" letterSpacing="-0.4px" variant="secondary">
            AMMs made easy
          </Text>
          <Text sx={{ textWrap: 'balance' }} variant="secondary">
            Balancer is a battle-tested toolkit for true AMM experimentation and innovation.
          </Text>
        </VStack>
      </VStack>
      <Stack
        align="start"
        direction={{ base: 'column', lg: 'row' }}
        justify="space-between"
        spacing={{ base: 'lg', lg: 'md' }}
        w="full"
      >
        {linkSections.map(section => (
          <VStack align="start" key={section.title} spacing={{ base: 'sm', lg: 'ms' }}>
            <Text color="font.secondary" fontSize={{ base: 'xs', md: 'xs' }} variant="eyebrow">
              {section.title}
            </Text>
            <VStack align="start" spacing={{ base: 'xs', lg: 'sm' }}>
              {section.links.map(link => (
                <Link
                  as={NextLink}
                  flex="auto"
                  flexBasis="row"
                  href={link.href}
                  key={link.href}
                  variant="nav"
                >
                  <HStack gap="xxs">
                    <Box
                      fontSize={{ base: 'sm', md: 'md' }}
                      fontWeight="medium"
                      letterSpacing="-0.25px"
                    >
                      {link.label}
                    </Box>
                    {link.isExternal ? (
                      <Box color="grayText">
                        <ArrowUpRight size={12} />
                      </Box>
                    ) : null}
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
          aria-label="Social icon"
          as={Link}
          bg="background.level2"
          h="44px"
          href={href}
          isExternal
          isRound
          key={href}
          rounded="full"
          variant="tertiary"
          w="44px"
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
      justify={{ base: 'start', lg: 'end' }}
      p={{ base: 'sm', lg: '0' }}
      spacing={{ base: 'sm', lg: 'md' }}
      w="full"
      wrap="wrap"
    >
      {legalLinks.map(link => (
        <Link
          as={NextLink}
          color="font.secondary"
          fontSize={{ base: 'xs', md: 'sm' }}
          href={link.href}
          key={link.href}
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
        <VStack align="start" pt="md" spacing="lg">
          <CardContent />
          <Divider />
          <Stack
            align="start"
            alignItems={{ base: 'none', lg: 'center' }}
            animate="show"
            as={motion.div}
            direction={{ base: 'column', lg: 'row' }}
            gap="md"
            initial="hidden"
            justify="space-between"
            variants={staggeredFadeIn}
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

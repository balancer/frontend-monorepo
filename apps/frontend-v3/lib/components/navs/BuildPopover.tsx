'use client'

import { Box, HStack, Link, Text, VStack, Flex } from '@chakra-ui/react'
import { BalancerIconCircular } from '@repo/lib/shared/components/icons/logos/BalancerIconCircular'
import { BeetsIconCircular } from '@repo/lib/shared/components/icons/logos/BeetsIconCircular'
import { CowIconCircular } from '@repo/lib/shared/components/icons/logos/CowIconCircular'
import { ArrowUpRight } from 'react-feather'
import { Picture } from '@repo/lib/shared/components/other/Picture'

const linkGroups = {
  'Builder resources': [
    {
      label: 'v3 Scaffold',
      href: 'https://github.com/balancer/scaffold-balancer-v3',
      isExternal: true,
    },
    { label: 'Code & contracts', href: 'https://github.com/balancer', isExternal: true },
    {
      label: 'Data & Analytics',
      href: 'https://docs.balancer.fi/data-and-analytics/data-and-analytics/subgraph.html',
      isExternal: true,
    },
    {
      label: 'Partner onboarding',
      href: 'https://docs.balancer.fi/partner-onboarding/onboarding-overview/introduction.html',
      isExternal: true,
    },
    {
      label: 'DAO & Partner OPs',
      href: 'https://balancer.defilytica.tools/',
      isExternal: true,
    },
  ],
  'In the docs': [
    {
      label: 'v3 core concepts',
      href: 'https://docs.balancer.fi/concepts/balancer-v3',
      isExternal: true,
    },
    { label: 'Build an AMM', href: 'https://docs.balancer.fi/build/amm', isExternal: true },
    { label: 'Build a hook', href: 'https://docs.balancer.fi/build/hooks', isExternal: true },
    {
      label: 'Build a router',
      href: 'https://docs.balancer.fi/build/sdk-and-router',
      isExternal: true,
    },
    {
      label: 'Integration guides',
      href: 'https://docs.balancer.fi/integration-guides/',
      isExternal: true,
    },
  ],
}

export function BuildPopover() {
  return (
    <Flex
      align="flex-start"
      direction={{ base: 'column', sm: 'row' }}
      gap={{ base: '5', sm: '20px', md: '40px' }}
    >
      <CreateAPool />
      {Object.entries(linkGroups).map(([title, links]) => (
        <VStack align="flex-start" key={title} minW={{ base: 'auto', md: '150px' }} spacing="sm">
          <Text fontWeight="bold">{title}</Text>
          <VStack align="flex-start" mt="xs">
            {links.map(link => (
              <Link
                _hover={{ textDecoration: 'none', color: 'font.highlight' }}
                alignItems="center"
                color="font.secondary"
                data-group
                display="flex"
                fontSize={{ base: 'sm', md: 'md' }}
                gap="xxs"
                href={link.href}
                isExternal={link.isExternal}
                key={link.label}
              >
                {link.label}{' '}
                {link.isExternal && (
                  <Box
                    _groupHover={{ opacity: 1 }}
                    opacity="0.5"
                    transition="all 0.2s var(--ease-out-cubic)"
                  >
                    <ArrowUpRight size={12} />
                  </Box>
                )}
              </Link>
            ))}
          </VStack>
        </VStack>
      ))}
    </Flex>
  )
}

function CreateAPool() {
  return (
    <Flex
      _hover={{ shadow: 'lg' }}
      borderRadius="md"
      flex="1"
      flexDirection="column"
      height="100%"
      justifyContent="center"
      overflow="hidden"
      p={{ base: 'ms', sm: 'md' }}
      position="relative"
      shadow="2xl"
      w={{ base: 'auto', md: '180px' }}
    >
      <Box bottom="0" left="0" position="absolute" right="0" top="0">
        <Picture
          altText="Background texture"
          defaultImgType="png"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgAvifPortrait
          imgAvifPortraitDark
          imgName="rock-slate"
          imgPng
          imgPngDark
          width="100%"
        />
      </Box>
      <Flex
        alignItems="center"
        direction="row"
        gap={{ base: 'ms', sm: 'md', lg: 'lg' }}
        position="relative"
        zIndex={2}
      >
        <VStack align="flex-start" spacing="sm">
          <Link
            _hover={{ color: 'font.highlight' }}
            alignItems="center"
            color="font.maxContrast"
            data-group
            display="flex"
            gap="xxs"
            href="https://pool-creator.balancer.fi/"
            isExternal
            variant="nav"
          >
            <Text
              _groupHover={{ color: 'font.highlight' }}
              color="font.maxContrast"
              fontWeight="bold"
              transition="color 0.2s var(--ease-out-cubic)"
            >
              Create a pool
            </Text>
            <Box
              _groupHover={{ opacity: 1 }}
              opacity="0.5"
              transition="all 0.2s var(--ease-out-cubic)"
            >
              <ArrowUpRight size={12} />
            </Box>
          </Link>
          <VStack align="flex-start" pt="xs" w="full">
            <PoolLink
              href="https://pool-creator.balancer.fi/v3"
              icon={<BalancerIconCircular size={32} />}
              isExternal
              label="Balancer"
            />
            <PoolLink
              href="https://pool-creator.balancer.fi/cow"
              icon={<CowIconCircular size={32} />}
              isExternal
              label="CoW AMM"
            />
            <PoolLink
              href="https://pool-creator.balancer.fi/beets"
              icon={<BeetsIconCircular size={32} />}
              isExternal
              label="Beets"
            />
          </VStack>
        </VStack>
      </Flex>
    </Flex>
  )
}

type PoolLinkProps = { href: string; icon: React.ReactNode; isExternal?: boolean; label: string }

function PoolLink({ href, icon, isExternal, label }: PoolLinkProps) {
  return (
    <Link
      _hover={{ color: 'font.highlight', textDecoration: 'none' }}
      color="font.maxContrast"
      href={href}
      isExternal={isExternal}
      py="xxs"
      role="group"
      rounded="md"
      w="full"
    >
      <HStack
        _groupHover={{ color: 'font.highlight' }}
        color="white"
        transition="color 0.2s var(--ease-out-cubic)"
      >
        {icon}
        <Text
          _groupHover={{ color: 'font.highlight' }}
          alignItems="center"
          color="font.maxContrast"
          display="flex"
          fontSize={{ base: 'sm', md: 'md' }}
          fontWeight="bold"
          gap="xxs"
        >
          {label}
          <Box _groupHover={{ opacity: 1 }} as="span" opacity="0.5">
            <ArrowUpRight size={12} />
          </Box>
        </Text>
      </HStack>
    </Link>
  )
}

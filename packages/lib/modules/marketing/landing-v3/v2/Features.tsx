/* eslint-disable max-len */
'use client'

import { Box, Grid, GridItem, Heading, Text, VStack, Link, chakra, Stack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

import { useState } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { PieIcon } from '@repo/lib/shared/components/icons/PieIcon'
import { StarsIconPlain } from '@repo/lib/shared/components/icons/StarsIconPlain'
import { FeatureCard } from './shared/FeatureCard'

const keyFeatures = [
  {
    title: 'Custom Pools',
    subTitle: 'Code less, build more.',
    description:
      'Design pools tailored to your vision with Balancer’s vault-first architecture. Build smarter, faster, and with less complexity.',
    icon: <PieIcon size={40} />,
  },
  {
    title: '100% Boosted Pools',
    subTitle: 'Passive Yield, Simplified.',
    description:
      'Put your liquidity to work 100% of the time. Seamless integration with Aave and Morpho delivers passive, diversified yield in a single click.',
    icon: <StarsIconPlain size={32} />,
  },
  {
    title: 'Hooks Framework',
    subTitle: 'Endless Possibilities',
    description:
      'Extend pool functionality with modular hooks. Customize pool behavior, implement advanced strategies, and unlock entirely new AMM design spaces with ease.',
    icon: <HookIcon size={70} />,
  },
]

const features = [
  {
    title: 'LVR/MEV Mitigation',
    shortDescription:
      'Balancer v3 focuses on minimizing MEV and maximizing LP profitability by collaborating with intent-centric projects like CowSwap.',
    description:
      'Balancer v3 focuses on minimizing MEV and maximizing LP profitability by collaborating with intent-centric projects like CowSwap.\n\nv3 leverages custom AMM logic and a hooks framework to enable third-party teams easily to develop MEV mitigation strategies.\n\nSupported by Balancer DAO, this approach aims to help bolster MEV innovation for LPs, enhancing fairness and profitability in on-chain interactions for the future to come.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Decimal Scaling',
    shortDescription:
      'To alleviate the challenges of managing tokens with variable decimals, the vault provides the pool with token balances and input values scaled to 18 decimals.',
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'Rate Scaling',
    shortDescription:
      'V3 abstracts the complexity of managing LSTs by moving all rate scaling into the vault, providing pools with uniform rate-scaled balances and input values by default, ensuring that yield from yield-bearing tokens is not captured by arbitrage traders.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Liquidity Invariant Approximation',
    shortDescription:
      'Supports unbalanced add/remove liquidity operations across all pool types, dramatically enhancing user experience, as users are not forced to add liquidity in proportional amounts.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Transient Accounting',
    shortDescription:
      "EIP-1153's transient op-codes unlock a new, expressive design, the “Till” pattern. This allows the vault to efficiently enforce contract-level invariants in the scope of a callback, supporting design patterns that were previously not possible.",
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'ERC20MultiToken',
    shortDescription:
      'Ensures atomic updates to pool token balances and total supply within the vault, reducing risks of read-only reentrancy attack vectors.',
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'Swap Fee Management',
    shortDescription:
      'Standardizes swap fee implementation within the vault for consistent interfaces across pools, while allowing flexibility at the hook level.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Pool Creator Fee',
    shortDescription:
      'Introduces a permissionless mechanism for external pool developers to earn a share of swap fees and yield, incentivizing innovative AMM creation.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Pool Pause Manager',
    shortDescription:
      'The pool can define its pause window on registration, relying on the vault to enforce the time window and manage authentication.',
    imageSrc: '/images/graphics/stone-1.png',
  },
]

function FeatureText({
  title,
  shortDescription,
  description,
  index,
}: {
  title: string
  shortDescription: string
  description?: string
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const isOdd = index % 2 === 1

  return (
    <VStack
      alignItems="start"
      position="relative"
      spacing="md"
      {...(isOdd && { bg: 'background.level0' })}
      p="md"
      rounded="lg"
    >
      <Heading as="h5" size="md">
        {title}
      </Heading>
      <Box position="relative">
        <Text color="font.secondary" fontSize="lg" whiteSpace="pre-line">
          {shortDescription}
          {description && (
            <Link ml="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Show less' : 'Read more'}
            </Link>
          )}
        </Text>
        {isExpanded && (
          <Box
            bg="background.level0"
            borderRadius="md"
            boxShadow="lg"
            left={-4}
            maxW="600px"
            p={4}
            position="absolute"
            top={-4}
            zIndex={10}
          >
            <Text color="font.secondary" fontSize="lg" whiteSpace="pre-line">
              {description}
              <Link ml="sm" onClick={() => setIsExpanded(false)}>
                Show less
              </Link>
            </Text>
          </Box>
        )}
      </Box>
    </VStack>
  )
}

export function Features() {
  return (
    <Noise position="relative">
      <DefaultPageContainer
        minH="800px"
        noVerticalPadding
        position="relative"
        pt={['xl', '3xl']}
        py={['xl', '10rem']}
      >
        <Heading as="h4" mx="auto" size="lg">
          <chakra.span color="font.primary">Custom liquidity solutions.</chakra.span>
          <chakra.span color="font.primary" style={{ opacity: 0.6 }}>
            {' '}
            By shifting repetitive development tasks into the heavily audited vault and formalizing
            custom pool requirements, the platform ensures consistency, flexibility, and faster
            development.
          </chakra.span>
        </Heading>

        <Grid gap="xl" mt="2xl" templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}>
          {keyFeatures.map((feature, index) => (
            <GridItem key={index}>
              <FeatureCard {...feature} iconProps={{ color: 'font.primary' }} />
            </GridItem>
          ))}
        </Grid>

        <Stack direction={{ base: 'column', lg: 'row' }} gap="2xl" mt="3xl">
          <Box alignSelf="flex-start" position="sticky" top="82px" w="full">
            <VStack alignItems="start" spacing="sm">
              <Heading as="h4" size="lg">
                Technical highlights
              </Heading>
              <Text color="font.secondary" fontSize="lg">
                Balancer v3 introduces a series of technical enhancements that streamline the
                development and deployment of custom pools, while maintaining the flexibility and
                interoperability that have made Balancer a leader in the DeFi space.
              </Text>
            </VStack>
          </Box>
          <VStack spacing="md" w="full">
            {features.map((feature, index) => (
              <FeatureText index={index} key={index} {...feature} />
            ))}
          </VStack>
        </Stack>
      </DefaultPageContainer>
      <Box
        bgGradient="linear(transparent 0%, background.base 50%, transparent 100%)"
        bottom="0"
        h="200px"
        left="0"
        mb="-100px"
        position="absolute"
        w="full"
      />
    </Noise>
  )
}

/* eslint-disable max-len */
'use client'

/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Box,
  Card,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Text,
  VStack,
  Link,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Image from 'next/image'

// @ts-ignore
import bgSrc from './images/circles-right.svg'
import { Code } from 'react-feather'
import { AddIcon } from '@chakra-ui/icons'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { useState } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'

const features = [
  {
    title: '100% Boosted Pools',
    shortDescription:
      'Balancer v3 introduces 100% Boosted Pools, enhancing capital efficiency for passive LPs.',
    description: `Balancer v3 introduces 100% Boosted Pools, enhancing capital efficiency for passive LPs.\n\nThese pools deposit idle liquidity in trusted platforms like Aave, providing LPs exposure to an additional layer of sustainable yield. Unlike v2, v3 registers yield-bearing tokens directly with the pool, using Buffers to facilitate gas-efficient swaps.\n\nBuffers act as simple two-token liquidity pools that hold a yield bearing token (waUSDC) and it's underlying counterpart (USDC), minimizing external calls and providing LPs with full yield exposure while optimizing gas usage.`,
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'Custom Pools & Reusable Hooks',
    shortDescription:
      'Balancer v3 is a platform for AMM experimentation and innovation, allowing custom pools to iterate on existing or define entirely new swap invariants.',
    description:
      "Balancer v3 is a platform for AMM experimentation and innovation, allowing custom pools to iterate on existing or define entirely new swap invariants. With the v3 vault handling much of the responsibility that was previously delegated to the pool contract, internally developed pools are significantly less complex. By shifting core design patterns out of the pool and into the vault, v3 produces a 10x improvement in pool developer experience.\n\nAdditionally, v3 introduces a hooks framework that allows developers to easily extend existing pool types at various key points throughout the pool's lifecycle, unlocking an infinite design space.",
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'LVR/MEV Mitigation',
    shortDescription:
      'Balancer v3 focuses on minimizing MEV and maximizing LP profitability by collaborating with intent-centric projects like CowSwap.',
    description:
      'Balancer v3 focuses on minimizing MEV and maximizing LP profitability by collaborating with intent-centric projects like CowSwap.\n\nv3 leverages custom AMM logic and a hooks framework to enable third-party teams easily to develop MEV mitigation strategies.\n\nSupported by Balancer DAO, this approach aims to help bolster MEV innovation for LPs, enhancing fairness and profitability in on-chain interactions for the future to come.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Simplified AMM Deployment',
    shortDescription:
      'Remove low-level tasks. Supply custom AMM logic, and harness the full benefit of an optimized tech stack.',
    imageSrc: '/images/graphics/stone-1.png',
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

function ContractCard({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <VStack alignItems="start" spacing="lg" w="full">
        <HStack alignItems="center" justifyContent="space-between" w="full">
          <HStack>
            <Box color="font.secondary">
              <Code size={16} />
            </Box>
            <Text color="font.secondary">Smart contract</Text>
          </HStack>
          <IconButton
            aria-label="Expand"
            fontSize="12px"
            h="30px"
            icon={<AddIcon />}
            isRound
            size="xs"
            variant="primary"
            w="30px"
          />
        </HStack>
        <VStack alignItems="start" mb="lg" w="80%">
          <Text fontSize="xl" fontWeight="bold">
            {title}
          </Text>
          <Text color="font.secondary">{description}</Text>
        </VStack>
      </VStack>
    </Card>
  )
}

function FeatureText({
  title,
  shortDescription,
  description,
  imageSrc,
}: {
  title: string
  shortDescription: string
  description?: string
  imageSrc: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <HStack alignItems="start" spacing="lg">
      <Box flexShrink={0} opacity={0.6}>
        <Image alt="feature" height={75} src={imageSrc} width={75} />
      </Box>
      <VStack alignItems="start" position="relative" spacing="md">
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
    </HStack>
  )
}

export function Build() {
  const isDarkMode = useIsDarkMode()

  return (
    <Noise>
      <Box position="relative">
        <Box
          bottom={0}
          h="700px"
          left={0}
          opacity={isDarkMode ? 0.1 : 0.4}
          position="absolute"
          right={0}
          top={300}
          w="45vw"
        >
          <Image
            alt="background"
            fill
            sizes="100vw"
            src={bgSrc}
            style={{ objectFit: 'contain', objectPosition: 'left' }}
          />
        </Box>
        <DefaultPageContainer minH="800px" noVerticalPadding position="relative" py="3xl">
          <Grid gap="xl" templateColumns="repeat(2, 1fr)">
            <GridItem>
              <VStack alignItems="start" spacing="md">
                <Heading as="h3" size="xl">
                  Building on v3 is easy
                </Heading>
                <Text color="font.secondary" fontSize="lg">
                  Balancer v3’s architecture focuses on simplicity, flexibility, and extensibility
                  at its core. The v3 vault more formally defines the requirements of a custom pool,
                  shifting core design patterns out of the pool and into the vault.
                </Text>
              </VStack>
            </GridItem>
            <GridItem />
          </Grid>
          <Grid gap="xl" templateColumns="repeat(2, 1fr)">
            <GridItem />
            <GridItem borderRadius="lg">
              <VStack alignItems="start" spacing="md">
                <Heading as="h4" size="lg">
                  Contracts
                </Heading>
                <Text color="font.secondary" fontSize="lg">
                  The four main contracts of Balancer v3 enhance flexibility and minimize the
                  intricacies involved in constructing pools, empowering builders to focus on
                  innovation rather than grappling with complex code.
                </Text>
              </VStack>
              <Grid
                gap="md"
                mt="2xl"
                templateColumns="repeat(2, 1fr)"
                templateRows="repeat(2, 1fr)"
              >
                <GridItem>
                  <ContractCard description="Entry-point for all pool operations" title="Router" />
                </GridItem>
                <GridItem>
                  <ContractCard description="Handles math for pool operations" title="Pool" />
                </GridItem>
                <GridItem>
                  <ContractCard description="Handles accounting & holds tokens" title="Vault" />
                </GridItem>
                <GridItem>
                  <ContractCard
                    description="Can execute actions before and/or after pool does math"
                    title="Hook"
                  />
                </GridItem>
              </Grid>
            </GridItem>
          </Grid>
          <Grid gap="2xl" mt="300px" templateColumns="repeat(2, 1fr)">
            {features.map((feature, index) => (
              <GridItem key={index}>
                <FeatureText {...feature} />
              </GridItem>
            ))}
          </Grid>
        </DefaultPageContainer>
      </Box>
    </Noise>
  )
}

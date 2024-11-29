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
import { ArrowUpRight, Code } from 'react-feather'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { useState } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion } from 'framer-motion'

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

const contracts = [
  {
    title: 'Router',
    url: 'https://docs-v3.balancer.fi/concepts/router/overview.html',
    shortDescription: 'Entry-point for all pool operations',
    description:
      'Routers serve as the pivotal interface for users, facilitating efficient interaction with the underlying Vault primitives. Rather than directly engaging with the Vault, users are encouraged to use Routers as their primary entry point. This approach streamlines operations and enhances flexibility by abstracting multi-step operations into simple user-facing functions.',
    tags: {
      'Common user actions': ['Initialize', 'Add', 'Remove', 'Swap'],
      Functions: [
        'Operation aggregation',
        'External API provision',
        'Vault integration',
        'Custom logic',
        'Dynamic updating',
      ],
    },
  },
  {
    title: 'Pool',
    url: 'https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/',
    shortDescription: 'Handles math for pool operations',
    description:
      'Balancer Pools are smart contracts that define how traders can swap between tokens on Balancer Protocol. The architecture of Balancer Protocol empowers anyone to create custom pool types. What makes Balancer Pools unique from those of other protocols is their unparalleled flexibility. With the introduction of Hooks and Dynamic Swap Fees, the degree of customization is boundless.\n\nBalancer has already developed, audited and deployed a variety of pool types showcasing diverse functionalities. These pools are readily accessible for existing use cases without requiring permission. ',
    tags: {
      'Existing pool types': [
        'Weighted pools',
        'Stable pool',
        '80/20 pool',
        'Boosted pool',
        'Liquidity Boostrapping Pools (LBP)',
      ],
    },
  },
  {
    title: 'Vault',
    url: 'https://docs-v3.balancer.fi/concepts/vault/',
    shortDescription: 'Handles accounting & holds tokens',
    description:
      'The Vault is the core of the Balancer protocol; it is a smart contract that holds and manages all tokens in each Balancer pool. First introduced in Balancer v2, the vault architecture separates token accounting from pool logic, allowing for simplified pool contracts that focus on the implementation of their swap, add liquidity and remove liquidity logic.',
    tags: {
      Features: [
        'Transient accounting',
        'ERC20MultiToken',
        'Liquidity Buffers',
        'Token types',
        'Decimal scaling',
        'Rate scaling',
        'Yield fee',
        'Swap fee',
        'Live balances',
        'Liquidity invariant approximation',
      ],
    },
  },
  {
    title: 'Hook',
    url: 'https://docs-v3.balancer.fi/concepts/core-concepts/hooks.html',
    shortDescription: 'Can execute actions before and/or after pool does math',
    description:
      'Hooks introduce a framework to extend existing pool types at various key points throughout the pool’s lifecycle. Hooks can execute actions during pool operation and also compute a dynamic swap fee.\n\nHooks are implemented as standalone contracts that can have their own internal logic and state. One hook contract can facilitate many pools (and pool types). The hook system is flexible and allows developers to implement custom logic at different points of the pool’s lifecycle.',
    tags: {
      'Pool lifecycle points': [
        'On pool register',
        'Pool initialization (before/after)',
        'Adds (before/after)',
        'Removes (before/after)',
        'Swaps (before/after)',
        'Dynamic swap fee computation',
      ],
    },
  },
]

function ContractCard({
  contract,
  isExpanded,
  onToggle,
}: {
  contract: (typeof contracts)[number]
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <Card h="full" w="full">
      <VStack alignItems="start" spacing="lg" w="full">
        <HStack alignItems="center" justifyContent="space-between" w="full">
          <HStack>
            <Box color="font.secondary">
              <Code size={16} />
            </Box>
            <Text color="font.secondary">Smart contract</Text>
          </HStack>
          <IconButton
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
            fontSize="12px"
            h="30px"
            icon={isExpanded ? <MinusIcon /> : <AddIcon />}
            isRound
            onClick={onToggle}
            size="xs"
            variant="primary"
            w="30px"
          />
        </HStack>
        <VStack alignItems="start" mb="lg">
          <HStack justifyContent="space-between" w="full">
            <Text fontSize="xl" fontWeight="bold">
              {contract.title}
            </Text>
            {isExpanded && (
              <Link href={contract.url} isExternal>
                <HStack spacing={0}>
                  <span>View docs</span>
                  <ArrowUpRight size={16} />
                </HStack>
              </Link>
            )}
          </HStack>

          <Text color="font.secondary" w="80%">
            {contract.shortDescription}
          </Text>
          {isExpanded && (
            <Text color="font.secondary" fontSize="lg" mt="sm" whiteSpace="pre-line">
              {contract.description}
            </Text>
          )}
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

const MotionGridItem = motion(GridItem)

export function Build() {
  const isDarkMode = useIsDarkMode()
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

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
          top={100}
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
              <AnimatePresence initial={false} mode="wait">
                <Grid
                  gap="md"
                  mt="2xl"
                  templateColumns="repeat(2, 1fr)"
                  templateRows="repeat(2, minmax(200px, auto))"
                >
                  {contracts.map((contract, index) => (
                    <MotionGridItem
                      animate={{
                        opacity: expandedCard && expandedCard !== contract.title ? 0 : 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                      }}
                      gridColumn={expandedCard === contract.title ? 'span 2' : 'auto'}
                      gridRow={expandedCard === contract.title ? 'span 2' : 'auto'}
                      initial={{
                        opacity: 1,
                        scale: 1,
                      }}
                      key={contract.title}
                      layout
                      order={expandedCard && expandedCard == contract.title ? 0 : index + 1}
                      style={{
                        display:
                          expandedCard && expandedCard !== contract.title ? 'hidden' : 'block',
                      }}
                      transition={{
                        layout: {
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.4,
                        },
                        opacity: { duration: 0.2 },
                      }}
                    >
                      <ContractCard
                        contract={contract}
                        isExpanded={expandedCard === contract.title}
                        onToggle={() =>
                          setExpandedCard(expandedCard === contract.title ? null : contract.title)
                        }
                      />
                    </MotionGridItem>
                  ))}
                </Grid>
              </AnimatePresence>
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

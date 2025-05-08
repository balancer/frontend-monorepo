/* eslint-disable max-len */
'use client'

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Box, Card, Grid, GridItem, HStack, IconButton, Text, VStack, Link } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

// @ts-ignore
import { ArrowUpRight, Code } from 'react-feather'
import { AddIcon, MinusIcon } from '@chakra-ui/icons'
import { useState } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion } from 'framer-motion'
import { RadialPattern } from './shared/RadialPattern'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'

const contracts = [
  {
    title: 'Router',
    url: 'https://docs.balancer.fi/concepts/router/overview.html',
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
    url: 'https://docs.balancer.fi/concepts/explore-available-balancer-pools/',
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
    url: 'https://docs.balancer.fi/concepts/vault/',
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
    url: 'https://docs.balancer.fi/concepts/core-concepts/hooks.html',
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

          <Text color="font.secondary" sx={{ textWrap: 'balance' }} w="80%">
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

const MotionGridItem = motion(GridItem)

export function Contracts() {
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const { isMobile } = useBreakpoints()

  return (
    <Noise>
      <Box position="relative">
        <Box
          bottom={0}
          h="700px"
          left={0}
          position="absolute"
          right={0}
          top="10rem"
          w={{ base: '80vw', lg: '45vw' }}
        >
          <RadialPattern
            circleCount={8}
            height={700}
            innerHeight={150}
            innerWidth={500}
            left={-400}
            padding="15px"
            position="absolute"
            top={0}
            width={1000}
          />
        </Box>
        <DefaultPageContainer
          minH="800px"
          noVerticalPadding
          position="relative"
          py={['3xl', '10rem']}
        >
          <Grid gap="xl" templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }}>
            {!isMobile && <GridItem />}
            <GridItem borderRadius="lg">
              <VStack alignItems="start" spacing="md">
                <WordsPullUp
                  as="h3"
                  color="font.primary"
                  fontSize="4xl"
                  fontWeight="bold"
                  letterSpacing="-0.04rem"
                  lineHeight={1}
                  text="Contracts"
                />
                <FadeIn delay={0.2} direction="up" duration={0.6}>
                  <Text color="font.secondary" fontSize="lg">
                    The four main contracts of Balancer v3 enhance flexibility and minimize the
                    intricacies involved in constructing pools, empowering builders to focus on
                    innovation rather than grappling with complex code.
                  </Text>
                </FadeIn>
              </VStack>
              <AnimatePresence initial={false} mode="wait">
                <Grid
                  gap="md"
                  mt="2xl"
                  position="relative"
                  templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
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
                        position:
                          expandedCard && expandedCard !== contract.title ? 'absolute' : 'relative',
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
        </DefaultPageContainer>
      </Box>
    </Noise>
  )
}

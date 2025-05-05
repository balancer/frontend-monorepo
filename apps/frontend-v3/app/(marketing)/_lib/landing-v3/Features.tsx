/* eslint-disable max-len */
'use client'

import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  Link,
  chakra,
  Stack,
  Center,
} from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

import { useState, useEffect, useRef } from 'react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { HookIcon } from '@repo/lib/shared/components/icons/HookIcon'
import { PieIcon } from '@repo/lib/shared/components/icons/PieIcon'
import { StarsIconPlain } from '@repo/lib/shared/components/icons/StarsIconPlain'
import { FeatureCard } from './shared/FeatureCard'
import { RadialPattern } from './shared/RadialPattern'
import { BalancerLogoAnimated } from '@repo/lib/shared/components/icons/BalancerIconAnimated'
import { useBreakpoints } from '@repo/lib/shared/hooks/useBreakpoints'
import { FadeIn } from '@repo/lib/shared/components/animations/FadeIn'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { motion, useInView } from 'framer-motion'

const MotionBox = motion(Box)
const MotionGrid = motion(Grid)
const MotionGridItem = motion(GridItem)

const keyFeatures = [
  {
    title: 'Custom Pools',
    subTitle: 'Streamlined custom pool creation',
    description:
      'Design pools tailored to your vision with Balancer’s Vault-first architecture. Build smarter, faster, and with less complexity.',
    icon: <PieIcon size={40} />,
  },
  {
    title: 'Hooks Framework',
    subTitle: 'Limitless pool customizability',
    description:
      'Extend pool functionality with modular hooks. Customize pool behavior, implement advanced strategies, and unlock entirely new AMM design spaces with ease.',
    icon: <HookIcon size={70} />,
  },
  {
    title: '100% Boosted Pools',
    subTitle: 'Boosted earnings, simplified strategy.',
    description:
      'Put your liquidity to work 100% of the time. Seamless integration with Aave and Morpho delivers passive, diversified yield in a single click.',
    icon: <StarsIconPlain size={32} />,
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
      'To alleviate the challenges of managing tokens with variable decimals, the Vault provides the pool with token balances and input values scaled to 18 decimals.',
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'Rate Scaling',
    shortDescription:
      'V3 abstracts the complexity of managing LSTs by moving all rate scaling into the Vault, providing pools with uniform rate-scaled balances and input values by default, ensuring that yield from yield-bearing tokens is not captured by arbitrage traders.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Liquidity Invariant Approximation',
    shortDescription:
      'Supports unbalanced add/remove liquidity operations across all pool types, drastically enhancing user experience, as users are not forced to add liquidity in proportional amounts.',
    imageSrc: '/images/graphics/stone-2.png',
  },
  {
    title: 'Transient Accounting',
    shortDescription:
      "EIP-1153's transient op-codes unlock a new, expressive design, the “Till” pattern. This allows the Vault to efficiently enforce contract-level invariants in the scope of a callback, supporting design patterns that were previously not possible.",
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'ERC20MultiToken',
    shortDescription:
      'Ensures atomic updates to pool token balances and total supply within the Vault, reducing risks of read-only reentrancy attack vectors.',
    imageSrc: '/images/graphics/stone-1.png',
  },
  {
    title: 'Swap Fee Management',
    shortDescription:
      'Standardizes swap fee implementation within the Vault for consistent interfaces across pools, while allowing flexibility at the hook level.',
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
      'The pool can define its pause window on registration, relying on the Vault to enforce the time window and manage authentication.',
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
      spacing="sm"
      {...(isOdd && { bg: 'background.level0' })}
      p="md"
      rounded="lg"
    >
      <Heading as="h5" size="md">
        {title}
      </Heading>
      <Box position="relative">
        <Text color="font.secondary" sx={{ textWrap: 'balance' }} whiteSpace="pre-line">
          {shortDescription}
          {description && (
            <Link ml="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Show less' : 'Read more'}
            </Link>
          )}
        </Text>
        {isExpanded && (
          <MotionBox
            animate={{ opacity: 1 }}
            bg="background.level0"
            borderRadius="md"
            boxShadow="lg"
            initial={{ opacity: 0 }}
            left={-4}
            maxW="600px"
            p={4}
            position="absolute"
            top={-4}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Text color="font.secondary" fontSize="lg" whiteSpace="pre-line">
              {description}
              <Link ml="sm" onClick={() => setIsExpanded(false)}>
                Show less
              </Link>
            </Text>
          </MotionBox>
        )}
      </Box>
    </VStack>
  )
}

export function Features() {
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isMobile } = useBreakpoints()

  const gridRef = useRef(null)
  const isInView = useInView(gridRef, { once: true, margin: '-50px' })

  const gridVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const gridItemVariants = {
    show: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
    hidden: { opacity: 0, filter: 'blur(3px)', scale: 0.95, y: 15 },
  }

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const windowHeight = window.innerHeight

        // Add a buffer of 100px to delay the start of the animation
        const buffer = 300

        // Calculate progress with buffer
        const progress = Math.min(
          Math.max(((windowHeight - (rect.top + buffer)) / rect.height) * 100, 0),
          100
        )
        setScrollPercentage(progress)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Noise position="relative">
      <DefaultPageContainer
        minH="800px"
        noVerticalPadding
        position="relative"
        pt={['xl', '3xl']}
        py={['3xl', '10rem']}
      >
        <FadeIn delay={0.2} direction="up" duration={0.6}>
          <Heading as="h4" mx="auto" size="lg">
            <chakra.span color="font.primary">Custom liquidity solutions.</chakra.span>
            <chakra.span color="font.primary" style={{ opacity: 0.6 }}>
              {' '}
              With v3, developers harness a tech stack that automates low-level development tasks,
              enabling them to focus exclusively on innovation.
            </chakra.span>
          </Heading>
        </FadeIn>

        <MotionGrid
          animate={isInView ? 'show' : 'hidden'}
          gap="xl"
          initial="hidden"
          mt="2xl"
          ref={gridRef}
          templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
          variants={gridVariants}
        >
          {keyFeatures.map((feature, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <MotionGridItem key={index} variants={gridItemVariants}>
              <FeatureCard {...feature} iconProps={{ color: 'font.primary' }} />
            </MotionGridItem>
          ))}
        </MotionGrid>

        <Stack direction={{ base: 'column', lg: 'row' }} gap="2xl" mt="3xl">
          <Box
            alignSelf="flex-start"
            h={isMobile ? 'auto' : '700px'}
            position="sticky"
            top="82px"
            w="full"
          >
            <VStack alignItems="start" spacing="lg">
              <WordsPullUp
                as="h2"
                color="font.primary"
                fontSize="4xl"
                fontWeight="bold"
                letterSpacing="-0.04rem"
                lineHeight={1}
                text="Technical highlights"
              />
              <FadeIn delay={0.2} direction="up" duration={0.6}>
                <Text color="font.secondary" fontSize="lg" sx={{ textWrap: 'pretty' }}>
                  Balancer v3 introduces a series of technical enhancements that streamline the
                  development and deployment of custom pools, while maintaining the flexibility and
                  interoperability that have made Balancer a leader in the DeFi space.
                </Text>
              </FadeIn>
            </VStack>
            {!isMobile && (
              <Center position="relative">
                <RadialPattern
                  circleCount={8}
                  height={600}
                  innerHeight={150}
                  innerWidth={150}
                  position="absolute"
                  progress={scrollPercentage}
                  top={-10}
                  width={600}
                >
                  <BalancerLogoAnimated size={100} />
                </RadialPattern>
              </Center>
            )}
          </Box>
          <VStack ref={containerRef} spacing="md" w="full">
            {features.map((feature, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <FadeIn direction="up" key={index} zIndex={10 - index}>
                <FeatureText index={index} {...feature} />
              </FadeIn>
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

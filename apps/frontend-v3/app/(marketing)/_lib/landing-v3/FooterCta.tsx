'use client'

import { Box, Text, Button, Center, HStack, Link, VStack } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from './shared/RadialPattern'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { motion, useInView } from 'framer-motion'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { MotionButtonProps } from './types'

const MotionButton = motion(Button) as React.FC<MotionButtonProps>

export function FooterCta() {
  const [patternProgress, setPatternProgress] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isInView) {
      interval = setInterval(() => {
        setPatternProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval!)
            return 100
          }
          return prev + 1 // Increment by 1 every 50ms for a total of 5 seconds
        })
      }, 15)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isInView])

  return (
    <Noise position="relative">
      <Box minH="800px" position="absolute" w="full">
        <Box
          bottom={0}
          display={{ base: 'none', xl: 'block' }}
          h="800px"
          left={0}
          position="absolute"
          top={0}
          w="100vw"
        >
          <RadialPattern
            circleCount={6}
            height={600}
            innerHeight={150}
            innerWidth={500}
            padding="15px"
            position="absolute"
            progress={patternProgress}
            right={{ base: '-700px', lg: '-700px', xl: '-600px', '2xl': '-480px' }}
            top="calc(50% - 300px)"
            width={1000}
          />
          <RadialPattern
            circleCount={6}
            height={600}
            innerHeight={150}
            innerWidth={500}
            left={{ base: '-700px', lg: '-700px', xl: '-600px', '2xl': '-480px' }}
            padding="15px"
            position="absolute"
            progress={patternProgress}
            top="calc(50% - 300px)"
            width={1000}
          />
        </Box>
      </Box>
      <Center minH="800px" position="relative">
        <RadialPattern
          circleCount={7}
          height={700}
          innerHeight={150}
          innerWidth={150}
          left="calc(50% - 350px)"
          position="absolute"
          progress={patternProgress}
          top="calc(50% - 350px)"
          width={700}
        ></RadialPattern>
        <VStack gap="lg" position="relative" pt="md">
          <WordsPullUp
            as="h2"
            color="font.primary"
            fontSize={{ base: '2xl', lg: '4xl' }}
            fontWeight="bold"
            letterSpacing="-0.04rem"
            lineHeight={1}
            pr={{ base: 0.8, lg: 0.9 }}
            text="Build on Balancer"
          />
          <Box>
            <Text color="font.secondary" textAlign="center" w="38ch">
              Launch faster with the most extensive DeFi toolkit made for creating AMMs / liquidity
              pools. Get day-1 swap volume via Balancer’s aggregator integrations and incentive
              system.
            </Text>
          </Box>
          <HStack gap="md" justifyContent="center" ref={ref}>
            <MotionButton
              animate={isInView ? { opacity: 1 } : {}}
              asChild
              initial={{ opacity: 0 }}
              size={{ base: 'md', lg: 'lg' }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
              variant="primary"
              w={{ base: '150px', lg: '180px' }}
            >
              <Link href="https://docs.balancer.fi" rel="noopener" target="_blank">
                View v3 docs
                <ArrowUpRight size="14px" />
              </Link>
            </MotionButton>
            <MotionButton
              animate={isInView ? { opacity: 1 } : {}}
              asChild
              initial={{ opacity: 0 }}
              size={{ base: 'md', lg: 'lg' }}
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
              variant="secondary"
              w={{ base: '150px', lg: '180px' }}
            >
              <Link
                href="https://github.com/balancer/scaffold-balancer-v3"
                rel="noopener"
                target="_blank"
              >
                Prototype on v3
                <ArrowUpRight size="14px" />
              </Link>
            </MotionButton>
          </HStack>
        </VStack>
      </Center>
    </Noise>
  )
}

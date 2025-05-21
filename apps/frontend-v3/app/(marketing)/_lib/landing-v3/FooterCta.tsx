'use client'

import { Box, Button, Center, HStack, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { RadialPattern } from './shared/RadialPattern'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { motion, useInView } from 'framer-motion'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import { ArrowUpRight } from 'react-feather'
import { BalancerLogoAnimated } from '@repo/lib/shared/components/icons/BalancerIconAnimated'
import { MotionButtonProps } from './types'

const MotionButton = motion(Button) as React.FC<MotionButtonProps>

export function FooterCta() {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [patternProgress, setPatternProgress] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isInView) {
      setShouldAnimate(true)
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
      <Box minH="700px" position="absolute" w="full">
        <Box
          bottom={0}
          display={{ base: 'none', xl: 'block' }}
          h="700px"
          left={0}
          position="absolute"
          top={0}
          w="100vw"
        >
          <RadialPattern
            circleCount={8}
            height={600}
            innerHeight={150}
            innerWidth={500}
            padding="15px"
            position="absolute"
            progress={patternProgress}
            right={{ base: -700, lg: -700, xl: -600, '2xl': -400 }}
            top="calc(50% - 300px)"
            width={1000}
          />
          <RadialPattern
            circleCount={8}
            height={600}
            innerHeight={150}
            innerWidth={500}
            left={{ base: -700, lg: -700, xl: -600, '2xl': -400 }}
            padding="15px"
            position="absolute"
            progress={patternProgress}
            top="calc(50% - 300px)"
            width={1000}
          />
        </Box>
      </Box>
      <Center minH="700px" position="relative">
        <RadialPattern
          circleCount={8}
          height={600}
          innerHeight={150}
          innerWidth={150}
          left="calc(50% - 300px)"
          position="absolute"
          progress={patternProgress}
          top="calc(50% - 300px)"
          width={600}
        >
          <Center color="background.level0" h="80px" position="relative" w="80px">
            <BalancerLogoAnimated iconColor="currentColor" noShadow size={100} />
          </Center>
        </RadialPattern>
        <VStack position="relative" pt="md" spacing="3xl">
          <WordsPullUp
            as="h2"
            color="font.primary"
            fontSize={{ base: '2xl', lg: '4xl' }}
            fontWeight="bold"
            letterSpacing="-0.04rem"
            lineHeight={1}
            pr={{ base: 0.8, lg: 0.9 }}
            text="Ready to build on Balancer?"
          />
          <HStack justifyContent="center" ref={ref} spacing="md">
            <MotionButton
              animate={shouldAnimate ? { opacity: 1 } : {}}
              as={NextLink}
              href="https://docs.balancer.fi"
              initial={{ opacity: 0 }}
              rightIcon={<ArrowUpRight size="16px" />}
              size={{ base: 'md', lg: 'lg' }}
              target="_blank"
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
              variant="primary"
              w={{ base: '150px', lg: '180px' }}
            >
              View v3 docs
            </MotionButton>
            <MotionButton
              animate={shouldAnimate ? { opacity: 1 } : {}}
              as={NextLink}
              href="https://github.com/balancer/scaffold-balancer-v3"
              initial={{ opacity: 0 }}
              rightIcon={<ArrowUpRight size="16px" />}
              size={{ base: 'md', lg: 'lg' }}
              target="_blank"
              transition={{ duration: 0.5, delay: 0.4, ease: 'easeInOut' }}
              variant="secondary"
              w={{ base: '150px', lg: '180px' }}
            >
              Prototype on v3
            </MotionButton>
          </HStack>
        </VStack>
      </Center>
    </Noise>
  )
}

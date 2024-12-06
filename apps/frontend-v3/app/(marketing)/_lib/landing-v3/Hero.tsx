/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Button, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion, useInView } from 'framer-motion'
import NextLink from 'next/link'
import Image from 'next/image'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { ArrowUpRight } from 'react-feather'

// @ts-ignore
import bgDarkSrc from './images/hero-bg-dark.png'
// @ts-ignore
import bgLightSrc from './images/hero-bg-light.png'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { PlayVideoButton } from '@repo/lib/shared/components/btns/PlayVideoButton'
import { SandBg } from './shared/SandBg'
import { useEffect, useRef, useState } from 'react'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'

const MotionText = motion(Text)
const MotionHeading = motion(Heading)
const MotionButton = motion(Button)
const MotionBox = motion(Box)

export function Hero() {
  const isDarkMode = useIsDarkMode()

  const [shouldAnimate, setShouldAnimate] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      setShouldAnimate(true)
    }
  }, [isInView])

  return (
    <Noise position="relative">
      <Box bottom={0} h="100vh" left={0} minH="600px" position="absolute" right={0} top={0}>
        <AnimatePresence>
          <motion.div
            animate={
              shouldAnimate ? { opacity: isDarkMode ? 0.3 : 0.5, willChange: 'opacity' } : {}
            }
            exit={{ opacity: 0 }}
            initial={{ opacity: 0.01 }}
            ref={ref}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          >
            {isDarkMode ? (
              <Image
                alt="background"
                fill
                sizes="100vw"
                src={bgDarkSrc}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <Image
                alt="background"
                fill
                sizes="80vw"
                src={bgLightSrc}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </Box>

      <DefaultPageContainer flex="1" h="100vh" minH="600px" noVerticalPadding position="relative">
        <Center h="full" justifyContent="start">
          <VStack alignItems="start" spacing="md">
            <MotionText
              animate={
                shouldAnimate
                  ? {
                      opacity: 1,
                      filter: 'blur(0px)',
                      willChange: 'opacity, filter',
                    }
                  : {}
              }
              background="font.specialSecondary"
              backgroundClip="text"
              fontSize="sm"
              initial={{ opacity: 0, filter: 'blur(3px)' }}
              textTransform="uppercase"
              transition={{ delay: 0.7, duration: 0.3, delayChildren: 0.5, ease: 'easeInOut' }}
            >
              Balancer V3 is live
            </MotionText>

            <WordsPullUp
              as="h1"
              color="font.primary"
              delay={0.7}
              fontSize={{ base: 'xl', md: '6xl' }}
              fontWeight="bold"
              lineHeight={1}
              pr="2"
              text="AMMs made easy"
            />
            <MotionHeading
              animate={
                shouldAnimate
                  ? {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      willChange: 'transform, opacity, filter',
                    }
                  : {}
              }
              as="h2"
              color="font.secondary"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="thin"
              initial={{ opacity: 0, y: 10, filter: 'blur(3px)' }}
              maxW="700px"
              transition={{ duration: 0.5, delay: 0.7, ease: 'easeInOut' }}
              w="full"
            >
              The ultimate platform for custom liquidity solutions. Balancer v3 perfectly balances
              simplicity and flexibility to reshape the future of AMMs.
            </MotionHeading>
            <HStack alignItems="center" mt="xl" spacing="xl">
              <MotionButton
                animate={shouldAnimate ? { opacity: 1 } : {}}
                as={NextLink}
                href="https://docs-v3.balancer.fi"
                initial={{ opacity: 0 }}
                rightIcon={<ArrowUpRight />}
                size="lg"
                target="_blank"
                transition={{ duration: 0.5, delay: 0.7, ease: 'easeInOut' }}
                variant="secondary"
              >
                View v3 docs
              </MotionButton>
              <HStack alignItems="center" spacing="md">
                <MotionBox
                  animate={shouldAnimate ? { opacity: 1 } : {}}
                  h="48px"
                  initial={{ opacity: 0 }}
                  overflow="hidden"
                  position="relative"
                  rounded="lg"
                  shadow="sm"
                  transition={{ duration: 0.5, delay: 0.7, ease: 'easeInOut' }}
                  w="72px"
                >
                  <SandBg variant={1} />
                  <Center h="full" position="relative" w="full">
                    <PlayVideoButton size={10} />
                  </Center>
                </MotionBox>
                <MotionText
                  animate={shouldAnimate ? { opacity: 1 } : {}}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.5, delay: 0.9, ease: 'easeInOut' }}
                >
                  Learn about Balancer v3
                </MotionText>
              </HStack>
            </HStack>
          </VStack>
        </Center>
      </DefaultPageContainer>
      <Box
        bgGradient="linear(transparent 0%, background.level0 50%, transparent 100%)"
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

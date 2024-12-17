/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Button, Center, Heading, HStack, Stack, Text, VStack } from '@chakra-ui/react'
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
          <VStack alignItems="start" spacing="xl">
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
              background="font.special"
              backgroundClip="text"
              fontSize="sm"
              initial={{ opacity: 0, filter: 'blur(3px)' }}
              transition={{ delay: 0.7, duration: 0.3, delayChildren: 0.5, ease: 'easeInOut' }}
              variant="eyebrow"
            >
              Balancer v3 is live
            </MotionText>

            <WordsPullUp
              as="h1"
              color="font.primary"
              delay={0.7}
              fontSize={{ base: '4xl', md: '6xl' }}
              fontWeight="bold"
              letterSpacing="-2px"
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
              transition={{ duration: 1, delay: 0.9, ease: 'easeInOut' }}
              w="full"
            >
              The ultimate platform for custom liquidity solutions. Balancer v3 perfectly balances
              simplicity and flexibility to reshape the future of AMMs.
            </MotionHeading>
            <Stack alignItems={{ base: 'start', md: 'center' }} direction="row" mt="0" spacing="ms">
              <MotionButton
                animate={
                  shouldAnimate
                    ? {
                        opacity: 1,
                        willChange: 'opacity',
                      }
                    : {}
                }
                as={NextLink}
                href="https://docs.balancer.fi"
                initial={{ opacity: 0 }}
                rightIcon={<ArrowUpRight size="20px" />}
                size="lg"
                target="_blank"
                transition={{ duration: 2, delay: 1.2 }}
                variant="primary"
              >
                View v3 docs
              </MotionButton>

              <MotionButton
                animate={
                  shouldAnimate
                    ? {
                        opacity: 1,
                        willChange: 'opacity',
                      }
                    : {}
                }
                as={NextLink}
                href="https://github.com/balancer/scaffold-balancer-v3"
                initial={{ opacity: 0 }}
                rightIcon={<ArrowUpRight size="20px" />}
                size="lg"
                target="_blank"
                transition={{ duration: 2, delay: 1.2 }}
                variant="secondary"
              >
                Prototype v3
              </MotionButton>
            </Stack>
            <HStack alignItems="center" mt="xl" spacing="md">
              <MotionBox
                animate={shouldAnimate ? { opacity: 1 } : {}}
                as={NextLink}
                h="56px"
                href="https://youtu.be/vjB2cogaO-c?si=E3q4o82JfPz-Hwkk"
                initial={{ opacity: 0 }}
                overflow="hidden"
                position="relative"
                rounded="lg"
                shadow="md"
                target="_blank"
                transition={{ duration: 2, delay: 1.4 }}
                w="90px"
              >
                <SandBg variant={1} />

                <Center h="full" position="relative" w="full">
                  <PlayVideoButton size={10} />
                </Center>
              </MotionBox>
              <MotionText
                animate={shouldAnimate ? { opacity: 1 } : {}}
                initial={{ opacity: 0 }}
                transition={{ duration: 2, delay: 1.4 }}
              >
                Learn about Balancer v3
              </MotionText>
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

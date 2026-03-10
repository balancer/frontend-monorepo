/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Button, Center, Heading, HStack, Link, Stack, Text, VStack } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion, useInView } from 'framer-motion'
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
import { useRef } from 'react'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { MotionButtonProps, MotionBoxProps } from './types'

const MotionText = motion(Text)
const MotionHeading = motion(Heading)
const MotionButton = motion(Button) as React.FC<MotionButtonProps>
const MotionBox = motion(Box) as React.FC<MotionBoxProps>

export function Hero() {
  const isDarkMode = useIsDarkMode()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <Noise position="relative">
      <Box bottom={0} h="100vh" left={0} minH="600px" position="absolute" right={0} top={0}>
        <AnimatePresence>
          <motion.div
            animate={isInView ? { opacity: isDarkMode ? 0.3 : 0.5, willChange: 'opacity' } : {}}
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
          <VStack alignItems="start" gap="xl">
            <MotionText
              animate={
                isInView
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
                isInView
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
            <Stack alignItems={{ base: 'start', md: 'center' }} direction="row" gap="ms" mt="0">
              <MotionButton
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        willChange: 'opacity',
                      }
                    : {}
                }
                asChild
                initial={{ opacity: 0 }}
                size="lg"
                transition={{ duration: 2, delay: 1.2 }}
                variant="primary"
              >
                <Link href="https://docs.balancer.fi" rel="noopener" target="_blank">
                  View v3 docs
                  <ArrowUpRight size="14px" />
                </Link>
              </MotionButton>

              <MotionButton
                animate={
                  isInView
                    ? {
                        opacity: 1,
                        willChange: 'opacity',
                      }
                    : {}
                }
                asChild
                initial={{ opacity: 0 }}
                size="lg"
                transition={{ duration: 2, delay: 1.2 }}
                variant="secondary"
              >
                <Link
                  href="https://github.com/balancer/scaffold-balancer-v3"
                  rel="noopener"
                  target="_blank"
                >
                  Prototype v3
                  <ArrowUpRight size="14px" />
                </Link>
              </MotionButton>
            </Stack>
            <HStack alignItems="center" gap="md" mt="xl">
              <MotionBox
                animate={isInView ? { opacity: 1 } : {}}
                asChild
                initial={{ opacity: 0 }}
                transition={{ duration: 2, delay: 1.4 }}
              >
                <Link
                  h="56px"
                  href="https://youtu.be/vjB2cogaO-c?si=E3q4o82JfPz-Hwkk"
                  overflow="hidden"
                  position="relative"
                  rel="noopener"
                  rounded="lg"
                  shadow="md"
                  target="_blank"
                  w="90px"
                >
                  <SandBg variant={1} />
                  <Center h="full" position="relative" w="full" zIndex={2}>
                    <PlayVideoButton size={10} />
                  </Center>
                </Link>
              </MotionBox>
              <MotionText
                animate={isInView ? { opacity: 1 } : {}}
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
        background="linear-gradient(transparent 0%, var(--chakra-colors-background-level0) 50%, transparent 100%)"
        bottom="0"
        h="200px"
        left="0"
        mb="-100px"
        position="absolute"
        w="full"
        zIndex={1}
      />
    </Noise>
  )
}

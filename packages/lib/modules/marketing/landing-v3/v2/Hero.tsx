/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Button, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion } from 'framer-motion'
import NextLink from 'next/link'
import Image from 'next/image'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { ArrowUpRight } from 'react-feather'

// @ts-ignore
import bgDarkSrc from './images/bg-dark-3.png'
// @ts-ignore
import bgLightSrc from './images/bg-light-4.png'
import { useIsDarkMode } from '@repo/lib/shared/services/chakra/useThemeColorMode'
import { PlayVideoButton } from '@repo/lib/shared/components/btns/PlayVideoButton'
import { SandBg } from './shared/SandBg'

export function Hero() {
  const isDarkMode = useIsDarkMode()

  return (
    <Noise>
      <Box bottom={0} h="100vh" left={0} minH="600px" position="absolute" right={0} top={0}>
        <AnimatePresence>
          <motion.div
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0.01 }}
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
            <Text
              background="font.specialSecondary"
              backgroundClip="text"
              fontSize="sm"
              textTransform="uppercase"
            >
              Balancer V3 is live
            </Text>
            <Heading as="h1" size={{ base: 'xl', md: '3xl' }}>
              AMMs made easy
            </Heading>
            <Heading
              as="h2"
              color="font.secondary"
              fontSize={{ base: 'xl', md: '2xl' }}
              fontWeight="thin"
              maxW="full"
              w="650px"
            >
              Balancer v3 powers the next generation of AMM innovation. Simplified pool creation
              with an optimized vault. Plug in audited reusable hooks for additional functionality.
            </Heading>
            <HStack>
              <Button
                as={NextLink}
                href="https://docs-v3.balancer.fi"
                mt="xl"
                rightIcon={<ArrowUpRight />}
                size="lg"
                target="_blank"
                variant="secondary"
              >
                View V3 docs
              </Button>
            </HStack>
            <HStack alignItems="center" mt="lg" spacing="md">
              <Box h="48px" overflow="hidden" position="relative" rounded="lg" shadow="md" w="72px">
                <SandBg variant={1} />
                <Center h="full" position="relative" w="full">
                  <PlayVideoButton size={10} />
                </Center>
              </Box>
              <Text>Learn about Balancer V3</Text>
            </HStack>
          </VStack>
        </Center>
      </DefaultPageContainer>
    </Noise>
  )
}

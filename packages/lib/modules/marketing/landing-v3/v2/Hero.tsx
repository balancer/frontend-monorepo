/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'

import { Box, Button, Center, Heading, HStack, Text, VStack } from '@chakra-ui/react'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { AnimatePresence, motion } from 'framer-motion'
import NextLink from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { ArrowUpRight } from 'react-feather'

// @ts-ignore
import zenBg1Src from './images/zenbg-1.webp'
// @ts-ignore
import zenBg2Src from './images/zenbg-2.webp'
// @ts-ignore
import zenBg3Src from './images/zenbg-3.webp'
// @ts-ignore
import zenBg4Src from './images/zenbg-4.webp'

const backgroundImages = [zenBg1Src, zenBg4Src, zenBg2Src, zenBg3Src]

export function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev === backgroundImages.length - 1 ? 0 : prev + 1))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Noise>
      <Box bottom={0} h="100vh" left={0} minH="600px" position="absolute" right={0} top={0}>
        <AnimatePresence>
          {backgroundImages.map(
            (image, index) =>
              index === currentImageIndex && (
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  // eslint-disable-next-line react/no-array-index-key
                  key={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                >
                  <Image
                    alt="background"
                    fill
                    sizes="100vm"
                    src={image}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                  />
                </motion.div>
              )
          )}
        </AnimatePresence>
      </Box>

      <DefaultPageContainer flex="1" h="100vh" minH="600px" noVerticalPadding>
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
            <Box h="48px" overflow="hidden" position="relative" rounded="lg" shadow="lg" w="72px">
              <Image alt="sand" fill src="/images/bgs/sand-1.jpeg" style={{ objectFit: 'cover' }} />
              <Box bg="background.base" h="full" opacity={0.8} position="absolute" w="full" />
            </Box>
          </VStack>
        </Center>
      </DefaultPageContainer>
    </Noise>
  )
}

'use client'

import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import { Box, Text, Card, Center, Heading, Link, VStack, Image } from '@chakra-ui/react'
import { ArrowUpRight } from 'react-feather'

export function CowHeader() {
  return (
    <FadeInOnView animateOnce={false}>
      <Card
        backgroundImage={{
          base: '/images/partners/cow/banner-mobile.svg',
          md: '/images/partners/cow/banner-desktop.svg',
        }}
        backgroundPosition={{ base: 'bottom', md: 'bottom' }}
        backgroundRepeat="no-repeat"
        backgroundSize="cover"
        bg="#194D05"
        rounded="xl"
      >
        <Center>
          <VStack maxW="xl" p="xl" spacing="lg" textAlign="center">
            <Heading
              color="#BCEC79"
              sx={{
                textWrap: 'balance',
              }}
            >
              The first MEV-capturing AMM
            </Heading>
            <Box color="#BCEC79" fontWeight="medium">
              CoW AMM protects LPs from LVR so they can provide liquidity with less risk and more
              return.{' '}
              <Link
                _hover={{ color: '#fff' }}
                color="#BCEC79"
                href="https://cow.fi/cow-amm"
                isExternal
                position="relative"
                role="group"
                textDecoration="underline"
              >
                Learn more
                <Box
                  _groupHover={{ transform: 'translateX(1.5px)' }}
                  display="inline"
                  position="absolute"
                  transition="transform 0.2s var(--ease-out-cubic)"
                >
                  <ArrowUpRight size={14} style={{ display: 'inline' }} />
                </Box>
              </Link>
            </Box>
            <Image alt="cow-logo" h="30px" src="/images/partners/cow/cow-amm-logo.svg" />
          </VStack>
        </Center>
      </Card>
    </FadeInOnView>
  )
}

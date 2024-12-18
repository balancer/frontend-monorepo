'use client'

import {
  VStack,
  Button,
  Text,
  GridItem,
  Grid,
  Box,
  Center,
  Link,
  Stack,
  IconButton,
  Heading,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ArrowUpRight } from 'react-feather'
import { GraniteBg } from './shared/GraniteBg'
import { SpearbitLogo } from '@repo/lib/shared/components/imgs/SpearbitLogo'
import { TrailOfBitsLogo } from '@repo/lib/shared/components/imgs/TrailOfBitsLogo'
import { CertoraLogo } from '@repo/lib/shared/components/imgs/CertoraLogo'
import { WordsPullUp } from '@repo/lib/shared/components/animations/WordsPullUp'
import { BlurIn } from '@repo/lib/shared/components/animations/BlurIn'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const MotionBox = motion(Box)

function AuditCard({ href, logo }: { href: string; logo: ReactNode }) {
  return (
    <NextLink href={href} rel="noopener noreferrer" target="_blank">
      <MotionBox
        minH="200px"
        overflow="hidden"
        position="relative"
        role="group"
        rounded="lg"
        shadow="lg"
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.3 },
        }}
      >
        <GraniteBg />
        <Center color="font.primary" h="full" position="absolute" w="full">
          {logo}
        </Center>
        <IconButton
          _groupHover={{
            opacity: 1,
          }}
          aria-label="View report"
          bottom="md"
          h="50px"
          icon={<ArrowUpRight />}
          isRound
          opacity={0}
          position="absolute"
          right="md"
          transition="opacity 0.3s ease"
          w="50px"
        />
      </MotionBox>
    </NextLink>
  )
}

export function Audits() {
  return (
    <Noise backgroundColor="background.level0WithOpacity ">
      <DefaultPageContainer noVerticalPadding py={['3xl', '10rem']}>
        <VStack align="start" spacing="lg" w="full">
          <Stack
            align="end"
            alignItems={{ base: 'start', lg: 'end' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            spacing="lg"
            w="full"
          >
            <VStack align="start" spacing="lg">
              <BlurIn delay={0.4}>
                <Text
                  background="font.specialSecondary"
                  backgroundClip="text"
                  fontSize="sm"
                  variant="eyebrow"
                >
                  SAFTEY & SECURITY
                </Text>
              </BlurIn>
              <WordsPullUp
                as="h2"
                color="font.primary"
                fontSize="4xl"
                fontWeight="bold"
                letterSpacing="-0.04rem"
                lineHeight={1}
                text="Audited by the best"
              />
            </VStack>
            <Button
              as={NextLink}
              href="https://github.com/balancer/balancer-v3-monorepo/tree/main/audits"
              rightIcon={<ArrowUpRight size="20px" />}
              variant="secondary"
            >
              View reports
            </Button>
          </Stack>
          <Grid
            gap="md"
            templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            w="full"
          >
            <GridItem>
              <AuditCard
                href="https://github.com/balancer/balancer-v3-monorepo/blob/main/audits/spearbit/2024-10-04.pdf"
                logo={<SpearbitLogo />}
              />
            </GridItem>
            <GridItem>
              <AuditCard
                href="https://github.com/balancer/balancer-v3-monorepo/blob/main/audits/trail-of-bits/2024-10-08.pdf"
                logo={<TrailOfBitsLogo />}
              />
            </GridItem>
            <GridItem>
              <AuditCard
                href="https://github.com/balancer/balancer-v3-monorepo/blob/main/audits/certora/2024-09-04.pdf"
                logo={<CertoraLogo />}
              />
            </GridItem>
          </Grid>
          <VStack align="start" mt="md" spacing="xs">
            <Heading fontSize="lg" variant="h6">
              Review the code and report vulnerabilities
            </Heading>
            <Text color="font.secondary">
              Up to $1m is up for grabs in the bug bounty on{' '}
              <Link href="https://immunefi.com/bug-bounty/balancer/information/" isExternal>
                Immunefi
              </Link>
              .
            </Text>
          </VStack>
        </VStack>
      </DefaultPageContainer>
    </Noise>
  )
}

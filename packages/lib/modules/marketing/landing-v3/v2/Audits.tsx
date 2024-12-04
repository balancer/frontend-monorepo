'use client'

import {
  VStack,
  Heading,
  Button,
  Text,
  GridItem,
  Grid,
  Box,
  Center,
  Link,
  Stack,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'
import { ArrowUpRight } from 'react-feather'
import { GraniteBg } from './shared/GraniteBg'
import { SpearbitLogo } from '@repo/lib/shared/components/imgs/SpearbitLogo'
import { TrailOfBitsLogo } from '@repo/lib/shared/components/imgs/TrailOfBitsLogo'
import { CertoraLogo } from '@repo/lib/shared/components/imgs/CertoraLogo'

export function Audits() {
  return (
    <Noise backgroundColor="background.level0WithOpacity ">
      <DefaultPageContainer noVerticalPadding py="2xl">
        <VStack align="start" spacing="lg" w="full">
          <Stack
            align="end"
            alignItems={{ base: 'start', lg: 'end' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            w="full"
          >
            <VStack align="start">
              <Text
                background="font.specialSecondary"
                backgroundClip="text"
                fontSize="sm"
                textTransform="uppercase"
              >
                SAFTEY & SECURITY
              </Text>
              <Heading>Audited by the best</Heading>
            </VStack>
            <Button
              as={NextLink}
              href="https://github.com/balancer/scaffold-balancer-v3"
              rightIcon={<ArrowUpRight />}
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
              <NextLink href="https://spearbit.com/" rel="noopener noreferrer" target="_blank">
                <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="lg">
                  <GraniteBg />
                  <Center color="font.primary" h="full" position="absolute" w="full">
                    <SpearbitLogo />
                  </Center>
                </Box>
              </NextLink>
            </GridItem>
            <GridItem>
              <NextLink
                href="https://www.trailofbits.com/"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="lg">
                  <GraniteBg />
                  <Center color="font.primary" h="full" position="absolute" w="full">
                    <TrailOfBitsLogo />
                  </Center>
                </Box>
              </NextLink>
            </GridItem>
            <GridItem>
              <NextLink href="https://www.certora.com/" rel="noopener noreferrer" target="_blank">
                <Box minH="200px" overflow="hidden" position="relative" rounded="lg" shadow="lg">
                  <GraniteBg />
                  <Center color="font.primary" h="full" position="absolute" w="full">
                    <CertoraLogo />
                  </Center>
                </Box>
              </NextLink>
            </GridItem>
          </Grid>
          <VStack align="start" mt="md" spacing="xs">
            <Text fontSize="lg">Review the code and report vulnerabilities</Text>
            <Text color="font.secondary">
              Up to $1m is up for grabs in the bug bounty on{' '}
              <Link href="https://immunefi.com/" isExternal>
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

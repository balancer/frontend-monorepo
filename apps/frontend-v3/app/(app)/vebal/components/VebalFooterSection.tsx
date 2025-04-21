'use client'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
import { Box, Button, Center, Flex, Heading, Link, Text, HStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function VebalFooterSection() {
  return (
    <Box overflow="hidden" position="relative" py="64px">
      <Box zIndex="-1">
        <RadialPattern
          bottom="-800px"
          circleCount={12}
          height={1200}
          innerHeight={150}
          innerWidth={150}
          left="calc(50% - 600px)"
          position="absolute"
          width={1200}
        />
      </Box>
      <Center>
        <FadeInOnView animateOnce={false}>
          <Flex direction="column" gap="lg" textAlign="center">
            <Heading
              as="h2"
              backgroundClip="text"
              bg="background.gold"
              display="flex"
              justifyContent="center"
              pb="0.5"
              size="lg"
              width="full"
            >
              Calling all BAL holders
            </Heading>
            <Text
              color="font.secondary"
              display="flex"
              justifyContent="center"
              lineHeight="1.4"
              maxWidth="40ch"
              textAlign="center"
              width="full"
            >
              Turn your BAL into veBAL to join Balancer governance, be eligible for incentives, and
              share in the success of the protocol.
            </Text>
            <Flex
              display="flex"
              gap="ms"
              justifyContent="center"
              margin="0 auto"
              maxWidth={320}
              width="full"
            >
              <Button as={NextLink} flex={1} href="/vebal/manage" size="lg" variant="gold">
                Manage veBAL
              </Button>

              <Button as={NextLink} flex={1} href="/vebal/vote" size="lg" variant="tertiary">
                Vote on gauges
              </Button>
            </Flex>
            <Link
              alignItems="center"
              color="font.secondary"
              display="inline-flex"
              href="https://docs.balancer.fi/concepts/governance/veBAL/"
              isExternal
              justifyContent="center"
              mt="sm"
            >
              <HStack gap="xxs">
                <Text color="font.secondary" fontSize={{ base: 'sm', md: 'md' }}>
                  View veBAL docs
                </Text>

                <Box color="grayText">
                  <ArrowUpRight size={12} />
                </Box>
              </HStack>
            </Link>
          </Flex>
        </FadeInOnView>
      </Center>
    </Box>
  )
}

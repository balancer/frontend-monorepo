'use client'

import { Box, Button, Center, Flex, Heading, Link, Text, HStack, Stack } from '@chakra-ui/react'
import { RadialPattern } from '@bal/app/(marketing)/_lib/landing-v3/shared/RadialPattern'
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
            <Stack alignItems="center" gap="md" px="md" width="full">
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
                css={{
                  textWrap: 'pretty',
                }}
                display="flex"
                justifyContent="center"
                lineHeight="1.4"
                maxWidth="40ch"
                textAlign="center"
                width="full"
              >
                Lock your BAL for veBAL to join Balancer governance, be eligible for incentives, and
                share in the success of the protocol.
              </Text>
            </Stack>
            <Flex
              display="flex"
              gap="ms"
              justifyContent="center"
              margin="0 auto"
              maxWidth={320}
              width="full"
            >
              <Button asChild flex={1} size="lg" variant="gold">
                <NextLink href="/vebal/manage">Manage veBAL</NextLink>
              </Button>
              <Button
                asChild
                bg="background.gold"
                bgClip="text"
                flex={1}
                size="lg"
                variant="tertiary"
              >
                <NextLink href="/vebal/vote">Vote on gauges</NextLink>
              </Button>
            </Flex>
            <Link
              alignItems="center"
              color="font.secondary"
              display="inline-flex"
              href="https://docs.balancer.fi/concepts/governance/veBAL/"
              justifyContent="center"
              mt="sm"
              rel="noopener noreferrer"
              target="_blank"
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

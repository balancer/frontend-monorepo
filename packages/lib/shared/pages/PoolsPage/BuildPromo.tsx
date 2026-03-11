'use client'

import { Box, Button, Center, Flex, Heading, Link, Text, HStack, Stack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'
import { RadialPattern } from '../../components/zen/RadialPattern'

export function BuildPromo() {
  return (
    <Box overflow="hidden" pb="40px" position="relative" pt={{ base: '120px', md: '94px' }}>
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
                display="flex"
                justifyContent="center"
                pb="0.5"
                size="h3"
                variant="special"
                width="full"
              >
                Ready to build on Balancer?
              </Heading>
              <Text
                color="font.secondary"
                css={{
                  textWrap: 'pretty',
                }}
                display="flex"
                justifyContent="center"
                lineHeight="1.4"
                maxWidth="38ch"
                textAlign="center"
                width="full"
              >
                Start by creating your own pool. Or prototype your own AMM with the most extensive
                DeFi builder toolkit.
              </Text>
            </Stack>
            <Flex
              display="flex"
              gap="ms"
              justifyContent="center"
              margin="0 auto"
              maxWidth={356}
              width="full"
            >
              <Button
                asChild
                flex={1}
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="bold"
                size="lg"
                variant="primary"
              >
                <NextLink href="/create">Create a pool</NextLink>
              </Button>
              <Button
                asChild
                flex={1}
                fontSize={{ base: 'md', md: 'lg' }}
                fontWeight="bold"
                size="lg"
                variant="tertiary"
              >
                <NextLink href="https://github.com/balancer/scaffold-balancer-v3">
                  Prototype on v3
                  <ArrowUpRight style={{ width: '14px', height: '14px', flexShrink: 0 }} />
                </NextLink>
              </Button>
            </Flex>
            <Link
              alignItems="center"
              color="font.secondary"
              display="inline-flex"
              href="https://docs.balancer.fi/"
              justifyContent="center"
              mt="sm"
              rel="noopener noreferrer"
              target="_blank"
            >
              <HStack gap="xxs">
                <Text color="font.secondary" fontSize={{ base: 'sm', md: 'md' }}>
                  View the docs
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

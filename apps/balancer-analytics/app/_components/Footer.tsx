'use client'

import { Box, Divider, HStack, Heading, Link, Stack, Text, VStack } from '@chakra-ui/react'
import Image from 'next/image'
import NextLink from 'next/link'
import { ArrowUpRight, GitHub } from 'react-feather'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'

type FooterLink = { label: string; href: string; icon?: 'github' }

const RESOURCES: FooterLink[] = [
  { label: 'Balancer App', href: 'https://balancer.fi' },
  { label: 'GitHub Repo', href: 'https://github.com/defilytica/frontend-monorepo', icon: 'github' },
  { label: 'DeFiLytica', href: 'https://defilytica.com' },
]

export function Footer() {
  return (
    <Box as="footer" background="background.level0" mt="2xl" shadow="innerLg">
      <DefaultPageContainer py="xl">
        <VStack align="stretch" spacing="lg">
          <Stack
            align={{ base: 'flex-start', lg: 'flex-start' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            spacing={{ base: 'xl', lg: 'md' }}
          >
            <VStack align="flex-start" maxW="420px" spacing="sm">
              <HStack spacing="sm">
                <Image
                  alt="DeFiLytica"
                  height={28}
                  src="/images/defilytica.png"
                  width={28}
                />
                <Heading fontSize="md" fontWeight="bold" letterSpacing="-0.2px" size="h6">
                  Balancer Analytics
                </Heading>
              </HStack>
              <Text color="font.secondary" fontSize="sm" sx={{ textWrap: 'balance' }}>
                Aggregated metrics across Balancer v2 and v3, served live from the Balancer API.
                Built and maintained by DeFiLytica.
              </Text>
            </VStack>

            <VStack align="flex-start" spacing="sm">
              <Text
                color="font.secondary"
                fontSize="xs"
                fontWeight="medium"
                letterSpacing="0.4px"
                textTransform="uppercase"
              >
                Resources
              </Text>
              <VStack align="flex-start" spacing="xs">
                {RESOURCES.map(link => (
                  <Link
                    _hover={{ color: 'font.maxContrast', textDecoration: 'none' }}
                    as={NextLink}
                    color="font.secondary"
                    fontSize="sm"
                    fontWeight="medium"
                    href={link.href}
                    isExternal
                    key={link.href}
                  >
                    <HStack spacing="xxs">
                      {link.icon === 'github' ? (
                        <Box as="span" position="relative" top="-1px">
                          <GitHub size={14} />
                        </Box>
                      ) : null}
                      <Box as="span">{link.label}</Box>
                      <Box as="span" color="grayText" position="relative" top="-2px">
                        <ArrowUpRight size={12} />
                      </Box>
                    </HStack>
                  </Link>
                ))}
              </VStack>
            </VStack>
          </Stack>

          <Divider />

          <Stack
            align={{ base: 'flex-start', lg: 'center' }}
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            spacing="sm"
          >
            <Text color="font.secondary" fontSize="xs">
              © {new Date().getFullYear()} DeFiLytica · Not affiliated with Balancer DAO.
            </Text>
            <Text color="font.secondary" fontSize="xs">
              Data sourced from the Balancer API and Snapshot.
            </Text>
          </Stack>
        </VStack>
      </DefaultPageContainer>
    </Box>
  )
}

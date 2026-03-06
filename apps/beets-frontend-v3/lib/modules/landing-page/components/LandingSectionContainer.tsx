import { Center, Heading, VStack, Text, Button, Flex, Box, HStack } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import React from 'react'
import NextLink from 'next/link'
import { ArrowUpRight } from 'react-feather'

export function LandingSectionContainer({
  children,
  title,
  subtitle,
  button,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
  button?: {
    text: string
    href: string
    isExternal?: boolean
  }
}) {
  return (
    <>
      <Center pb="2xl" textAlign="center" width="full">
        <VStack>
          <Heading fontSize="5xl" maxW="full">
            {title}
          </Heading>
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w={{ base: 'full', lg: '2xl' }}>
            {subtitle}
          </Text>
        </VStack>
      </Center>
      <DefaultPageContainer noVerticalPadding>
        {children}
        {button && (
          <Flex justify="center" pt="2xl">
            <Button asChild minWidth="160px" variant="primary">
              {button.isExternal ? (
                <a href={button.href} rel="noopener noreferrer" target="_blank">
                  <HStack>
                    <Box>{button.text}</Box>
                    <ArrowUpRight size={16} />
                  </HStack>
                </a>
              ) : (
                <NextLink href={button.href}>{button.text}</NextLink>
              )}
            </Button>
          </Flex>
        )}
      </DefaultPageContainer>
    </>
  )
}

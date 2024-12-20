import { Center, Heading, VStack, Text, Button, Flex } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import React from 'react'
import NextLink from 'next/link'

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
            <Button
              as={NextLink}
              href={button.href}
              minWidth="160px"
              target={button.isExternal ? '_blank' : undefined}
              variant="primary"
            >
              {button.text}
            </Button>
          </Flex>
        )}
      </DefaultPageContainer>
    </>
  )
}

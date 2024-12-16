import { Center, Heading, VStack, Text, Button, Box, Flex } from '@chakra-ui/react'
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
  }
}) {
  return (
    <>
      <Center textAlign="center" pb="2xl">
        <VStack>
          <Heading fontSize="5xl">{title}</Heading>
          <Text fontSize="2xl" fontWeight="thin" maxW="full" w="2xl">
            {subtitle}
          </Text>
        </VStack>
      </Center>
      <DefaultPageContainer noVerticalPadding>
        {children}
        {button && (
          <Flex justify="center" pt="2xl">
            <Button variant="primary" as={NextLink} href={button.href} minWidth="160px">
              {button.text}
            </Button>
          </Flex>
        )}
      </DefaultPageContainer>
    </>
  )
}

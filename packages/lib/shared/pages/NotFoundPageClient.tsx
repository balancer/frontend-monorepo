'use client'

import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { Button, Heading, VStack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

interface NotFoundPageClientProps {
  title: string
  description: string
  redirectUrl: string
  redirectText: string
}

export function NotFoundPageClient({
  title,
  description,
  redirectUrl,
  redirectText,
}: NotFoundPageClientProps) {
  return (
    <DefaultPageContainer minH="80vh">
      <VStack align="start" spacing="md">
        <Heading size="md">{title}</Heading>
        <VStack align="start" spacing="xs">
          <Text>{description}</Text>
        </VStack>
        <Button as={NextLink} href={redirectUrl} size="sm">
          {redirectText}
        </Button>
      </VStack>
    </DefaultPageContainer>
  )
}

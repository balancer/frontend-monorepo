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
      <VStack align="start" gap="md">
        <Heading size="md">{title}</Heading>
        <VStack align="start" gap="xs">
          <Text>{description}</Text>
        </VStack>
        <Button asChild size="sm">
          <NextLink href={redirectUrl}>{redirectText}</NextLink>
        </Button>
      </VStack>
    </DefaultPageContainer>
  )
}

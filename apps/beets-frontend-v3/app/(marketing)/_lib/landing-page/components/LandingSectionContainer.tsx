import { Center, Heading, VStack, Text } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import React from 'react'

export function LandingSectionContainer({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle: string
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
      <DefaultPageContainer noVerticalPadding pb="3xl">
        {children}
      </DefaultPageContainer>
    </>
  )
}

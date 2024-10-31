'use client'
import { Heading, VStack } from '@chakra-ui/react'
import FadeInOnView from '@repo/lib/shared/components/containers/FadeInOnView'

export default function Debug() {
  return (
    <FadeInOnView>
      <VStack margin="lg" padding="lg">
        <Heading size="md">Demos</Heading>
        <div>NO debug examples for Beets yet</div>
      </VStack>
    </FadeInOnView>
  )
}

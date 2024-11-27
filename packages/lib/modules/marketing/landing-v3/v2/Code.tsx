'use client'

import { Heading } from '@chakra-ui/react'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import Noise from '@repo/lib/shared/components/layout/Noise'

export function Code() {
  return (
    <Noise backgroundColor="background.level0WithOpacity">
      <DefaultPageContainer>
        <Heading>Code</Heading>
      </DefaultPageContainer>
    </Noise>
  )
}

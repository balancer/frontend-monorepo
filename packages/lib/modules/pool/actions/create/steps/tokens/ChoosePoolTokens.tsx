import { VStack, Heading } from '@chakra-ui/react'
import { TokenInputSelector } from '@repo/lib/modules/tokens/TokenInput/TokenInput'

export function ChoosePoolTokens() {
  return (
    <VStack align="start" spacing="md" w="full">
      <Heading color="font.maxContrast" size="md">
        Choose pool tokens
      </Heading>
      <TokenInputSelector token={undefined} weight={undefined} />
    </VStack>
  )
}

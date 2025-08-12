import { VStack, Heading, Flex, Spacer } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'

export function PoolPreview() {
  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
          rounded: 'xl',
        }}
      >
        <VStack align="start" p="lg" spacing="md" w="full">
          <Flex alignItems="center" w="full">
            <Heading color="font.maxContrast" size="md">
              Pool preview
            </Heading>
            <Spacer />
          </Flex>
        </VStack>
      </NoisyCard>
    </>
  )
}

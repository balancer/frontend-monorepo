import { VStack, Heading, Flex } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolTypeCard } from './PoolTypeCard'
import { PoolTokensCard } from './PoolTokensCard'
import { PoolTokensInWalletCard } from './PoolTokensInWalletCard'

export function PoolCreationPreview() {
  return (
    <>
      <NoisyCard
        cardProps={{
          w: 'full',
          overflow: 'hidden',
          rounded: 'xl',
        }}
      >
        <VStack align="start" p="lg" spacing="lg" w="full">
          <Flex alignItems="center" w="full">
            <Heading color="font.maxContrast" size="md">
              Pool preview
            </Heading>
          </Flex>

          <PoolTypeCard />
          <PoolTokensCard />
          <PoolTokensInWalletCard />
        </VStack>
      </NoisyCard>
    </>
  )
}

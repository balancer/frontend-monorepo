import { VStack, Heading, HStack, Text } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PoolTypeCard } from './PoolTypeCard'
import { PoolTokensCard } from './PoolTokensCard'
import { PoolTokensInWalletCard } from './PoolTokensInWalletCard'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { Icon } from '@chakra-ui/react'
import { Trash2 } from 'react-feather'

export function PoolCreationPreview() {
  const { resetPoolCreationForm } = usePoolCreationForm()

  return (
    <NoisyCard
      cardProps={{
        w: 'full',
        overflow: 'hidden',
        rounded: 'xl',
      }}
    >
      <VStack align="start" p="lg" spacing="lg" w="full">
        <HStack alignItems="end" justifyContent="space-between" w="full">
          <Heading color="font.maxContrast" size="md">
            Pool preview
          </Heading>
          <HStack cursor="pointer" onClick={resetPoolCreationForm} spacing="sm" zIndex={1}>
            <Icon as={Trash2} color="font.secondary" />
            <Text color="font.secondary" size="sm">
              Delete & restart
            </Text>
          </HStack>
        </HStack>

        <PoolTypeCard />
        <PoolTokensCard />
        <PoolTokensInWalletCard />
      </VStack>
    </NoisyCard>
  )
}

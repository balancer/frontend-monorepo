import { VStack, Heading, HStack, Text } from '@chakra-ui/react'
import { NoisyCard } from '@repo/lib/shared/components/containers/NoisyCard'
import { PreviewPoolType } from './PreviewPoolType'
import { PreviewPoolTokens } from './PreviewPoolTokens'
import { PreviewPoolTokensInWallet } from './PreviewPoolTokensInWallet'
import { PreviewPoolDetails } from './PreviewPoolDetails'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { Icon } from '@chakra-ui/react'
import { Trash2 } from 'react-feather'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'

export function PreviewPoolCreation() {
  const { resetPoolCreationForm } = usePoolCreationForm()
  const { isBeforeStep } = usePoolCreationFormSteps()

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

        <PreviewPoolType />
        <PreviewPoolTokens isBeforeStep={isBeforeStep('Tokens')} />
        <PreviewPoolTokensInWallet isBeforeStep={isBeforeStep('Tokens')} />
        <PreviewPoolDetails isBeforeStep={isBeforeStep('Details')} />
      </VStack>
    </NoisyCard>
  )
}
